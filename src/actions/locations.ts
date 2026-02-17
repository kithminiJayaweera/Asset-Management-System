'use server';

import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';
import { ILocation } from '@/types';

export async function createLocation(data: Partial<ILocation>) {
  try {
    await dbConnect();
    const location = await Location.create(data);
    return { success: true, data: JSON.parse(JSON.stringify(location)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLocations(organizationId: string, parentId?: string | null) {
  try {
    await dbConnect();
    const query: any = { organizationId };
    if (parentId !== undefined) {
      query.parentId = parentId || null;
    }
    const locations = await Location.find(query).sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(locations)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLocation(id: string, data: Partial<ILocation>) {
  try {
    await dbConnect();
    const location = await Location.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!location) {
      return { success: false, error: 'Location not found' };
    }
    return { success: true, data: JSON.parse(JSON.stringify(location)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLocation(id: string) {
  try {
    await dbConnect();
    const location = await Location.findByIdAndDelete(id);
    if (!location) {
      return { success: false, error: 'Location not found' };
    }
    return { success: true, data: JSON.parse(JSON.stringify(location)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
