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

    asset.status = 'maintenance';
    asset.assignedTo = undefined;
    await asset.save();

    return NextResponse.json({
      success: true,
      data: maintenance,
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
      .populate('assetId', 'name assetTag')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: maintenanceRecords,
    });
  } catch (error: any) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}
