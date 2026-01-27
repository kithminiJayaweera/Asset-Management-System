import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { ApiResponse, IAsset } from '@/types';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/assets/[id] - Get a specific asset
export async function GET(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const asset = await Asset.findById(id)
      .populate('assignedTo', 'name email department position')
      .populate('organizationId', 'name')
      .lean();

    if (!asset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IAsset>>({
      success: true,
      data: asset as IAsset,
    });
  } catch (error: any) {
    console.error('Error fetching asset:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PUT /api/assets/[id] - Update an asset
export async function PUT(request: NextRequest, context: Params) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = await context.params;

    const asset = await Asset.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('organizationId', 'name')
      .lean();

    if (!asset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IAsset>>({
      success: true,
      data: asset as IAsset,
      message: 'Asset updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating asset:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/[id] - Delete an asset
export async function DELETE(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const asset = await Asset.findByIdAndDelete(id);

    if (!asset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
