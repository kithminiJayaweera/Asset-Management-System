// Server Actions for Assets
'use server';

import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { revalidatePath } from 'next/cache';
import { IAsset } from '@/types';

export async function getAssets(organizationId: string) {
  try {
    await dbConnect();
    
    const assets = await Asset.find({ organizationId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(assets));
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw new Error('Failed to fetch assets');
  }
}

export async function getAssetById(id: string) {
  try {
    await dbConnect();
    
    const asset = await Asset.findById(id)
      .populate('assignedTo', 'name email department')
      .populate('organizationId', 'name')
      .lean();
    
    return JSON.parse(JSON.stringify(asset));
  } catch (error) {
    console.error('Error fetching asset:', error);
    throw new Error('Failed to fetch asset');
  }
}

export async function createAsset(data: Partial<IAsset>) {
  try {
    await dbConnect();
    
    const asset = await Asset.create(data);
    
    revalidatePath('/admin/assets');
    revalidatePath('/employee');
    
    return JSON.parse(JSON.stringify(asset));
  } catch (error) {
    console.error('Error creating asset:', error);
    throw new Error('Failed to create asset');
  }
}

export async function updateAsset(id: string, data: Partial<IAsset>) {
  try {
    await dbConnect();
    
    const asset = await Asset.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    
    revalidatePath('/admin/assets');
    revalidatePath('/employee');
    
    return JSON.parse(JSON.stringify(asset));
  } catch (error) {
    console.error('Error updating asset:', error);
    throw new Error('Failed to update asset');
  }
}

export async function deleteAsset(id: string) {
  try {
    await dbConnect();
    
    await Asset.findByIdAndDelete(id);
    
    revalidatePath('/admin/assets');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw new Error('Failed to delete asset');
  }
}
