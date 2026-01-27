// Server Actions for Organizations
'use server';

import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import { revalidatePath } from 'next/cache';
import { IOrganization } from '@/types';

export async function getOrganizations() {
  try {
    await dbConnect();
    
    const organizations = await Organization.find()
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(organizations));
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw new Error('Failed to fetch organizations');
  }
}

export async function getOrganizationById(id: string) {
  try {
    await dbConnect();
    
    const organization = await Organization.findById(id).lean();
    
    return JSON.parse(JSON.stringify(organization));
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw new Error('Failed to fetch organization');
  }
}

export async function createOrganization(data: Partial<IOrganization>) {
  try {
    await dbConnect();
    
    const organization = await Organization.create(data);
    
    revalidatePath('/admin/organizations');
    
    return JSON.parse(JSON.stringify(organization));
  } catch (error: any) {
    console.error('Error creating organization:', error);
    
    if (error.code === 11000) {
      throw new Error('Organization name or email already exists');
    }
    
    throw new Error('Failed to create organization');
  }
}

export async function updateOrganization(id: string, data: Partial<IOrganization>) {
  try {
    await dbConnect();
    
    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    
    revalidatePath('/admin/organizations');
    
    return JSON.parse(JSON.stringify(organization));
  } catch (error) {
    console.error('Error updating organization:', error);
    throw new Error('Failed to update organization');
  }
}

export async function deleteOrganization(id: string) {
  try {
    await dbConnect();
    
    await Organization.findByIdAndDelete(id);
    
    revalidatePath('/admin/organizations');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw new Error('Failed to delete organization');
  }
}
