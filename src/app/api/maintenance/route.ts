import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Maintenance from '@/models/Maintenance';
import Asset from '@/models/Asset';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      assetId,
      issueTitle,
      issueDescription,
      maintenanceType,
      priority,
      expectedReturnDate,
      assignedVendor,
      estimatedCost,
      notes,
      organizationId,
    } = body;

    if (!assetId || !issueTitle || !issueDescription || !maintenanceType || !priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // ✅ Rule 1: Only active assets can go to maintenance
    if (asset.status !== 'active') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot send ${asset.status} asset to maintenance. Only active assets can be sent to maintenance.` 
        },
        { status: 400 }
      );
    }

    const maintenance = await Maintenance.create({
      assetId,
      issueTitle,
      issueDescription,
      maintenanceType,
      priority,
      status: 'pending',
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
      assignedVendor,
      estimatedCost,
      notes,
      organizationId: organizationId || asset.organizationId,
    });

    // ✅ Step 2: Update Asset - Set to maintenance + track start date
    asset.status = 'maintenance';
    asset.maintenance = {
      ...asset.maintenance,
      maintenanceStartDate: new Date(),
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
    };
    await asset.save();

    // ✅ Emit real-time event
    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('assetId', 'name assetTag _id')
      .lean();
    const serializedMaintenance = JSON.parse(JSON.stringify(populatedMaintenance));
    
    if (global.io) {
      global.io.emit('maintenance_created', {
        maintenanceId: maintenance._id,
        assetId: assetId,
        issueTitle: issueTitle,
        status: 'pending',
        data: serializedMaintenance,
      });
    }

    return NextResponse.json({
      success: true,
      data: serializedMaintenance,
      message: 'Asset sent to maintenance successfully',
    });
  } catch (error: any) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    const query: any = {};
    if (assetId) query.assetId = assetId;
    if (organizationId) query.organizationId = organizationId;
    if (status) query.status = status;

    const maintenanceRecords = await Maintenance.find(query)
      .populate('assetId', 'name assetTag _id')
      .sort({ createdAt: -1 })
      .lean();

    // Serialize to ensure proper data transmission
    const serialized = JSON.parse(JSON.stringify(maintenanceRecords));

    return NextResponse.json({
      success: true,
      data: serialized,
    });
  } catch (error: any) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}
