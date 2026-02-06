import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Maintenance from '@/models/Maintenance';
import { ApiResponse } from '@/types';

// GET /api/maintenance - Get all maintenance records
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const assetId = searchParams.get('assetId');
    const organizationId = searchParams.get('organizationId');

    const query: any = {};
    if (assetId) query.assetId = assetId;
    if (organizationId) query.organizationId = organizationId;

    const maintenanceRecords = await Maintenance.find(query)
      .populate('assetId', 'name assetTag')
      .sort({ performedDate: -1 })
      .lean();

    return NextResponse.json<ApiResponse<any[]>>({
      success: true,
      data: maintenanceRecords,
    });
  } catch (error: any) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Create a new maintenance record
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const maintenance = await Maintenance.create(body);

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('assetId', 'name assetTag')
      .lean();

    return NextResponse.json<ApiResponse<any>>(
      { success: true, data: populatedMaintenance, message: 'Maintenance record created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}
