// Server Actions for Users/Employees
'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';
import { IUser } from '@/types';

export async function getUsers(organizationId: string) {
  try {
    await dbConnect();
    
    const users = await User.find({ organizationId })
      .select('-password')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function getUserById(id: string) {
  try {
    await dbConnect();
    
    const user = await User.findById(id)
      .select('-password')
      .populate('organizationId', 'name')
      .lean();
    
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

export async function createUser(data: Partial<IUser>) {
  try {
    await dbConnect();
    
    const user = await User.create(data);
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;
    
    revalidatePath('/admin/employees');
    
    return JSON.parse(JSON.stringify(userWithoutPassword));
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      throw new Error('Email already exists');
    }
    
    throw new Error('Failed to create user');
  }
}

export async function updateUser(id: string, data: Partial<IUser>) {
  try {
    await dbConnect();
    
    // Don't allow password update through this action
    const { password, ...updateData } = data;
    
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();
    
    revalidatePath('/admin/employees');
    
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

export async function deleteUser(id: string) {
  try {
    await dbConnect();
    
    await User.findByIdAndDelete(id);
    
    revalidatePath('/admin/employees');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}
