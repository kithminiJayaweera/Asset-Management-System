import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Desk from '@/models/Desk';
import Asset from '@/models/Asset';
import { ApiResponse, IDesk } from '@/types';

/**
 * GET /api/desks/[id]
 * Retrieve a single desk by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const desk = await Desk.findById(id)
      .populate('locationId', 'name type description')
      .populate('floorPlanId', 'name imageUrl')
      .populate('assignedTo', 'name email department position')
      .populate('assignedAssets', 'assetTag name status condition imageUrl')
      .lean();

    if (!desk) {
      return NextResponse.json(
        { success: false, error: 'Desk not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: desk } as ApiResponse<IDesk>,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching desk:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch desk' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/desks/[id]
 * Update a desk
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const updates = { ...body };

    // Prevent updating certain fields
    delete updates._id;
    delete updates.organizationId;
    delete updates.createdAt;
    delete updates.updatedAt;

    const desk = await Desk.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('locationId', 'name type')
      .populate('floorPlanId', 'name')
      .populate('assignedTo', 'name email')
      .lean();

    if (!desk) {
      return NextResponse.json(
        { success: false, error: 'Desk not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: desk } as ApiResponse<IDesk>,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating desk:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update desk' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/desks/[id]
 * Delete a desk (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Check if there are assets assigned to this desk
    const assetCount = await Asset.countDocuments({ deskId: id });

    if (assetCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete desk with ${assetCount} assigned assets. Please reassign assets first.` 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Soft delete
    const desk = await Desk.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).lean();

    if (!desk) {
      return NextResponse.json(
        { success: false, error: 'Desk not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Desk deleted successfully' } as ApiResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting desk:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete desk' } as ApiResponse,
      { status: 500 }
    );
  }
}
