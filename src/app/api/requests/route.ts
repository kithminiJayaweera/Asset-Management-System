import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import '@/models'; // Import all models
import AssetRequest from '@/models/AssetRequest';
import Notification from '@/models/Notification';
import { ApiResponse, IAssetRequest } from '@/types';
import { emitNotification } from '@/lib/socket';

// GET /api/requests - Get all asset requests
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const requestedBy = searchParams.get('requestedBy');

    const query: any = {};
    
    if (organizationId) query.organizationId = organizationId;
    if (status) query.status = status;
    if (requestedBy) query.requestedBy = requestedBy;

    const requests = await AssetRequest.find(query)
      .populate('requestedBy', 'name email department position employeeId')
      .populate('assetId', 'name assetTag category status assignedTo')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json<ApiResponse<IAssetRequest[]>>({
      success: true,
      data: requests as IAssetRequest[],
    });
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST /api/requests - Create a new asset request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const assetRequest = await AssetRequest.create(body);

    const populatedRequest = await AssetRequest.findById(assetRequest._id)
      .populate('requestedBy', 'name email department position employeeId')
      .populate('assetId', 'name assetTag category status assignedTo')
      .populate('approvedBy', 'name email')
      .lean();

    // Notify admins about new request
    const notification = await Notification.create({
      userId: 'admin',
      type: 'asset_request',
      title: 'New Asset Request',
      message: `${body.requestedBy?.name || 'Employee'} requested ${body.assetCategory}`,
      data: { requestId: assetRequest._id },
    });
    emitNotification('admin', notification);

    return NextResponse.json<ApiResponse<IAssetRequest>>(
      { success: true, data: populatedRequest as IAssetRequest, message: 'Request created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating request:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to create request' },
      { status: 500 }
    );
  }
}
