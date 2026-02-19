import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FloorPlan from '@/models/FloorPlan';
import Desk from '@/models/Desk';
import { ApiResponse, IFloorPlan } from '@/types';

/**
 * GET /api/floorplans/[id]
 * Retrieve a single floor plan by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const floorPlan = await FloorPlan.findById(id)
      .populate('locationId', 'name type description parentId')
      .populate('organizationId', 'name')
      .populate('metadata.uploadedBy', 'name email')
      .lean();

    if (!floorPlan) {
      return NextResponse.json(
        { success: false, error: 'Floor plan not found' } as ApiResponse,
        { status: 404 }
      );
    }

    // Also fetch associated desks
    const desks = await Desk.find({ floorPlanId: id })
      .populate('assignedTo', 'name email')
      .lean();

    return NextResponse.json(
      { 
        success: true, 
        data: {
          ...floorPlan,
          desks,
        }
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching floor plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch floor plan' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/floorplans/[id]
 * Update a floor plan
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

    const floorPlan = await FloorPlan.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('locationId', 'name type')
      .populate('organizationId', 'name')
      .lean();

    if (!floorPlan) {
      return NextResponse.json(
        { success: false, error: 'Floor plan not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: floorPlan } as ApiResponse<IFloorPlan>,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating floor plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update floor plan' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/floorplans/[id]
 * Delete a floor plan (soft delete - set isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Check if there are desks associated with this floor plan
    const deskCount = await Desk.countDocuments({ floorPlanId: id });

    if (deskCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete floor plan with ${deskCount} associated desks. Please remove desks first.` 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Soft delete
    const floorPlan = await FloorPlan.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).lean();

    if (!floorPlan) {
      return NextResponse.json(
        { success: false, error: 'Floor plan not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Floor plan deleted successfully' } as ApiResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting floor plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete floor plan' } as ApiResponse,
      { status: 500 }
    );
  }
}
