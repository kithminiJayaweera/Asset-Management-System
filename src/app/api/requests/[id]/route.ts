import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AssetRequest from '@/models/AssetRequest';
import Asset from '@/models/Asset';
import { ApiResponse, IAssetRequest } from '@/types';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/requests/[id]
export async function GET(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const assetRequest = await AssetRequest.findById(id)
      .populate('requestedBy', 'name email department')
      .populate('assetId', 'name assetTag status')
      .populate('approvedBy', 'name email')
      .lean();

    if (!assetRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IAssetRequest>>({
      success: true,
      data: assetRequest as IAssetRequest,
    });
  } catch (error: any) {
    console.error('Error fetching request:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// PUT /api/requests/[id] - Update request (approve/reject)
export async function PUT(request: NextRequest, context: Params) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = await context.params;

    // If approving an assignment request, update asset status
    if (body.status === 'approved') {
      const assetRequest = await AssetRequest.findById(id);
      
      if (assetRequest && assetRequest.requestType === 'assignment' && assetRequest.assetId) {
        await Asset.findByIdAndUpdate(assetRequest.assetId, {
          status: 'assigned',
          assignedTo: assetRequest.requestedBy,
        });
      }

      body.approvalDate = new Date();
    }

    const updatedRequest = await AssetRequest.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('requestedBy', 'name email')
      .populate('assetId', 'name assetTag')
      .populate('approvedBy', 'name email')
      .lean();

    if (!updatedRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IAssetRequest>>({
      success: true,
      data: updatedRequest as IAssetRequest,
      message: 'Request updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating request:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE /api/requests/[id]
export async function DELETE(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const assetRequest = await AssetRequest.findByIdAndDelete(id);

    if (!assetRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting request:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete request' },
      { status: 500 }
    );
  }
}
