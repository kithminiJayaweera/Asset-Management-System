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
    const body = await request.json();

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
      if (body.actualCost !== undefined) maintenance.actualCost = body.actualCost;
      if (body.notes !== undefined) maintenance.notes = body.notes;
      if (body.performedBy !== undefined) maintenance.performedBy = body.performedBy;

      // Step 2: Update Asset Back to Active
      asset.status = 'active';
      asset.maintenance = {
        ...asset.maintenance,
        lastMaintenanceDate: new Date(),
        maintenanceStartDate: undefined,
        expectedReturnDate: undefined,
        condition: body.assetCondition || asset.maintenance.condition,
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
      }

      // Clear maintenance dates
      asset.maintenance = {
        ...asset.maintenance,
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
    await asset.save();

    // ✅ Fetch updated record with populated asset
    const updatedMaintenance = await Maintenance.findById(id)
      .populate('assetId', 'name assetTag _id')
      .lean();
    const serializedMaintenance = JSON.parse(JSON.stringify(updatedMaintenance));

    // ✅ Emit real-time event
    if (global.io) {
      global.io.emit('maintenance_updated', {
        maintenanceId: id,
        status: body.status,
        previousStatus: maintenance.status,
        assetId: maintenance.assetId.toString(),
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
