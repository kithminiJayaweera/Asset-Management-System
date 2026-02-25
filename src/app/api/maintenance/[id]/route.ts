import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Maintenance from '@/models/Maintenance';
import Asset from '@/models/Asset';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/maintenance/[id]
export async function GET(request: NextRequest, context: Params) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid maintenance ID' },
        { status: 400 }
      );
    }

    const maintenance = await Maintenance.findById(id)
      .populate('assetId', 'name assetTag')
      .lean();

    if (!maintenance) {
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: maintenance,
    });
  } catch (error: any) {
    console.error('Error fetching maintenance record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch maintenance record' },
      { status: 500 }
    );
  }
}

// PUT /api/maintenance/[id]
export async function PUT(request: NextRequest, context: Params) {
  try {
    await connectDB();
    const { id } = await context.params;
    
    // Handle both JSON and FormData
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
          if (key.startsWith('file_')) {
            // Handle files
            if (!body.files) body.files = [];
            body.files.push(value);
          } else {
            body[key] = value;
          }
        }
      } else {
        // Default to JSON parsing
        body = await request.json();
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid maintenance ID' },
        { status: 400 }
      );
    }

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    const asset = await Asset.findById(maintenance.assetId);
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Associated asset not found' },
        { status: 404 }
      );
    }

    // ✅ When status changes to "completed"
    if (body.status === 'completed') {
      // Step 1: Update Maintenance Record
      maintenance.status = 'completed';
      maintenance.completionDate = new Date();
      if (body.actualCost && body.actualCost !== '') {
        const cost = parseFloat(body.actualCost);
        if (!isNaN(cost)) maintenance.actualCost = cost;
      }
      if (body.notes !== undefined && body.notes !== '') maintenance.notes = body.notes;
      if (body.performedBy !== undefined && body.performedBy !== '') maintenance.performedBy = body.performedBy;

      // Step 2: Update Asset Back to Active
      asset.status = 'active';
      const currentMaintenance = asset.maintenance || {};
      asset.maintenance = {
        ...currentMaintenance,
        lastMaintenanceDate: new Date(),
        maintenanceStartDate: undefined,
        expectedReturnDate: undefined,
        condition: body.assetCondition || currentMaintenance.condition,
      };

      // Create audit log
      try {
        await AuditLog.create({
          entityType: 'asset',
          entityId: maintenance.assetId.toString(),
          action: 'Maintenance Completed',
          performedBy: body.performedBy || 'system',
          changes: {
            maintenanceId: id,
            status: 'completed',
            actualCost: body.actualCost,
          },
        });
      } catch (auditError) {
        console.error('Error creating audit log:', auditError);
      }
    }
    // ✅ When status changes to "closed" with lost/retired scenario
    else if (body.status === 'closed') {
      maintenance.status = 'closed';
      maintenance.completionDate = new Date();

      // Handle lost asset during maintenance
      if (body.assetFinalStatus === 'lost') {
        asset.status = 'lost';
        maintenance.notes = (maintenance.notes || '') + '\n[LOST DURING MAINTENANCE]';
      }
      // Handle asset beyond repair
      else if (body.assetFinalStatus === 'retired') {
        asset.status = 'retired';
        maintenance.notes = (maintenance.notes || '') + '\n[RETIRED - BEYOND REPAIR]';
      } else {
        // Default to active if no final status specified
        asset.status = 'active';
      }

      // Clear maintenance dates
      const currentMaintenance = asset.maintenance || {};
      asset.maintenance = {
        ...currentMaintenance,
        maintenanceStartDate: undefined,
        expectedReturnDate: undefined,
      };

      // Create audit log
      try {
        await AuditLog.create({
          entityType: 'asset',
          entityId: maintenance.assetId.toString(),
          action: 'Maintenance Closed',
          performedBy: body.performedBy || 'system',
          changes: {
            maintenanceId: id,
            status: 'closed',
            assetFinalStatus: body.assetFinalStatus,
          },
        });
      } catch (auditError) {
        console.error('Error creating audit log:', auditError);
      }
    }
    // Handle other status updates
    else if (body.status === 'in-progress' || body.status === 'pending' || body.status === 'cancelled') {
      maintenance.status = body.status;
      if (body.notes !== undefined) maintenance.notes = body.notes;
    }

    await maintenance.save();
    
    // Only save asset if we made changes to it
    if (body.status === 'completed' || body.status === 'closed') {
      await asset.save();
    }

    // ✅ Fetch updated record with populated asset
    const updatedMaintenance = await Maintenance.findById(id)
      .populate('assetId', 'name assetTag _id')
      .lean();
    const serializedMaintenance = JSON.parse(JSON.stringify(updatedMaintenance));

    // ✅ Emit real-time event
    if (global.io) {
      const assetIdStr = maintenance.assetId ? (typeof maintenance.assetId === 'string' ? maintenance.assetId : maintenance.assetId.toString()) : '';
      global.io.emit('maintenance_updated', {
        maintenanceId: id,
        status: body.status,
        previousStatus: maintenance.status,
        assetId: assetIdStr,
        action: body.status === 'completed' ? 'completed' : body.status === 'closed' ? 'closed' : 'status_changed',
        data: serializedMaintenance,
      });
    }

    return NextResponse.json({
      success: true,
      data: serializedMaintenance,
      message: `Maintenance record updated successfully`,
    });
  } catch (error: any) {
    console.error('Error updating maintenance record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update maintenance record' },
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance/[id]
export async function DELETE(request: NextRequest, context: Params) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid maintenance ID' },
        { status: 400 }
      );
    }

    const maintenance = await Maintenance.findByIdAndDelete(id);

    if (!maintenance) {
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    // ✅ Emit real-time event
    if (global.io) {
      global.io.emit('maintenance_deleted', {
        maintenanceId: id,
        assetId: maintenance.assetId.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Maintenance record deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete maintenance record' },
      { status: 500 }
    );
  }
}
