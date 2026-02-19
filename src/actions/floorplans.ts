'use server';

import dbConnect from '@/lib/mongodb';
import FloorPlan from '@/models/FloorPlan';
import Desk from '@/models/Desk';
import { IFloorPlan, IDesk } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Get all floor plans for an organization
 */
export async function getFloorPlans(organizationId: string): Promise<IFloorPlan[]> {
  try {
    await dbConnect();

    const floorPlans = await FloorPlan.find({ organizationId, isActive: true })
      .populate('locationId', 'name type')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(floorPlans));
  } catch (error) {
    console.error('Error fetching floor plans:', error);
    throw new Error('Failed to fetch floor plans');
  }
}

/**
 * Get a single floor plan by ID with desks
 */
export async function getFloorPlanById(id: string): Promise<{
  floorPlan: IFloorPlan;
  desks: IDesk[];
}> {
  try {
    await dbConnect();

    const floorPlan = await FloorPlan.findById(id)
      .populate('locationId', 'name type description')
      .populate('organizationId', 'name')
      .lean();

    if (!floorPlan) {
      throw new Error('Floor plan not found');
    }

    const desks = await Desk.find({ floorPlanId: id, isActive: true })
      .populate('assignedTo', 'name email')
      .populate('assignedAssets', 'assetTag name status')
      .lean();

    return JSON.parse(
      JSON.stringify({
        floorPlan,
        desks,
      })
    );
  } catch (error) {
    console.error('Error fetching floor plan:', error);
    throw new Error('Failed to fetch floor plan');
  }
}

/**
 * Create a new floor plan
 */
export async function createFloorPlan(data: Partial<IFloorPlan>): Promise<IFloorPlan> {
  try {
    await dbConnect();

    const floorPlan = await FloorPlan.create(data);

    const populatedFloorPlan = await FloorPlan.findById(floorPlan._id)
      .populate('locationId', 'name type')
      .populate('organizationId', 'name')
      .lean();

    revalidatePath('/floorplans');

    return JSON.parse(JSON.stringify(populatedFloorPlan));
  } catch (error) {
    console.error('Error creating floor plan:', error);
    throw new Error('Failed to create floor plan');
  }
}

/**
 * Update a floor plan
 */
export async function updateFloorPlan(
  id: string,
  data: Partial<IFloorPlan>
): Promise<IFloorPlan> {
  try {
    await dbConnect();

    const floorPlan = await FloorPlan.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('locationId', 'name type')
      .populate('organizationId', 'name')
      .lean();

    if (!floorPlan) {
      throw new Error('Floor plan not found');
    }

    revalidatePath('/floorplans');
    revalidatePath(`/floorplans/${id}`);

    return JSON.parse(JSON.stringify(floorPlan));
  } catch (error) {
    console.error('Error updating floor plan:', error);
    throw new Error('Failed to update floor plan');
  }
}

/**
 * Delete a floor plan (soft delete)
 */
export async function deleteFloorPlan(id: string): Promise<void> {
  try {
    await dbConnect();

    // Check for associated desks
    const deskCount = await Desk.countDocuments({ floorPlanId: id, isActive: true });
    if (deskCount > 0) {
      throw new Error(
        `Cannot delete floor plan with ${deskCount} active desks. Please remove desks first.`
      );
    }

    await FloorPlan.findByIdAndUpdate(id, { $set: { isActive: false } });

    revalidatePath('/floorplans');
  } catch (error: any) {
    console.error('Error deleting floor plan:', error);
    throw new Error(error.message || 'Failed to delete floor plan');
  }
}

/**
 * Get all desks for a floor plan
 */
export async function getDesks(floorPlanId: string): Promise<IDesk[]> {
  try {
    await dbConnect();

    const desks = await Desk.find({ floorPlanId, isActive: true })
      .populate('assignedTo', 'name email department')
      .populate('assignedAssets', 'assetTag name status condition')
      .sort({ deskNumber: 1 })
      .lean();

    return JSON.parse(JSON.stringify(desks));
  } catch (error) {
    console.error('Error fetching desks:', error);
    throw new Error('Failed to fetch desks');
  }
}

/**
 * Create a new desk
 */
export async function createDesk(data: Partial<IDesk>): Promise<IDesk> {
  try {
    await dbConnect();

    const desk = await Desk.create(data);

    const populatedDesk = await Desk.findById(desk._id)
      .populate('locationId', 'name type')
      .populate('floorPlanId', 'name')
      .lean();

    revalidatePath(`/floorplans/${data.floorPlanId}`);

    return JSON.parse(JSON.stringify(populatedDesk));
  } catch (error) {
    console.error('Error creating desk:', error);
    throw new Error('Failed to create desk');
  }
}

/**
 * Update a desk
 */
export async function updateDesk(id: string, data: Partial<IDesk>): Promise<IDesk> {
  try {
    await dbConnect();

    const desk = await Desk.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('locationId', 'name type')
      .populate('floorPlanId', 'name')
      .populate('assignedTo', 'name email')
      .lean();

    if (!desk) {
      throw new Error('Desk not found');
    }

    revalidatePath(`/floorplans/${desk.floorPlanId}`);

    return JSON.parse(JSON.stringify(desk));
  } catch (error) {
    console.error('Error updating desk:', error);
    throw new Error('Failed to update desk');
  }
}

/**
 * Delete a desk (soft delete)
 */
export async function deleteDesk(id: string): Promise<void> {
  try {
    await dbConnect();

    const desk = await Desk.findByIdAndUpdate(id, { $set: { isActive: false } });

    if (!desk) {
      throw new Error('Desk not found');
    }

    revalidatePath(`/floorplans/${desk.floorPlanId}`);
  } catch (error) {
    console.error('Error deleting desk:', error);
    throw new Error('Failed to delete desk');
  }
}

/**
 * Assign a user to a desk
 */
export async function assignDeskToUser(deskId: string, userId: string): Promise<IDesk> {
  try {
    await dbConnect();

    const desk = await Desk.findByIdAndUpdate(
      deskId,
      { $set: { assignedTo: userId, status: 'occupied' } },
      { new: true }
    )
      .populate('assignedTo', 'name email department')
      .lean();

    if (!desk) {
      throw new Error('Desk not found');
    }

    revalidatePath(`/floorplans/${desk.floorPlanId}`);

    return JSON.parse(JSON.stringify(desk));
  } catch (error) {
    console.error('Error assigning desk:', error);
    throw new Error('Failed to assign desk');
  }
}

/**
 * Unassign a user from a desk
 */
export async function unassignDeskFromUser(deskId: string): Promise<IDesk> {
  try {
    await dbConnect();

    const desk = await Desk.findByIdAndUpdate(
      deskId,
      { $unset: { assignedTo: 1 }, $set: { status: 'available' } },
      { new: true }
    ).lean();

    if (!desk) {
      throw new Error('Desk not found');
    }

    revalidatePath(`/floorplans/${desk.floorPlanId}`);

    return JSON.parse(JSON.stringify(desk));
  } catch (error) {
    console.error('Error unassigning desk:', error);
    throw new Error('Failed to unassign desk');
  }
}

/**
 * Assign an asset to a desk
 */
export async function assignAssetToDesk(deskId: string, assetId: string): Promise<IDesk> {
  try {
    await dbConnect();

    const desk = await Desk.findById(deskId);

    if (!desk) {
      throw new Error('Desk not found');
    }

    // Check capacity
    if (desk.assignedAssets && desk.assignedAssets.length >= (desk.capacity || 5)) {
      throw new Error('Desk is at capacity');
    }

    const updatedDesk = await Desk.findByIdAndUpdate(
      deskId,
      { $addToSet: { assignedAssets: assetId } },
      { new: true }
    )
      .populate('assignedAssets', 'assetTag name status')
      .lean();

    revalidatePath(`/floorplans/${desk.floorPlanId}`);

    return JSON.parse(JSON.stringify(updatedDesk));
  } catch (error: any) {
    console.error('Error assigning asset to desk:', error);
    throw new Error(error.message || 'Failed to assign asset to desk');
  }
}

/**
 * Remove an asset from a desk
 */
export async function removeAssetFromDesk(deskId: string, assetId: string): Promise<IDesk> {
  try {
    await dbConnect();

    const desk = await Desk.findByIdAndUpdate(
      deskId,
      { $pull: { assignedAssets: assetId } },
      { new: true }
    )
      .populate('assignedAssets', 'assetTag name status')
      .lean();

    if (!desk) {
      throw new Error('Desk not found');
    }

    revalidatePath(`/floorplans/${desk.floorPlanId}`);

    return JSON.parse(JSON.stringify(desk));
  } catch (error) {
    console.error('Error removing asset from desk:', error);
    throw new Error('Failed to remove asset from desk');
  }
}
