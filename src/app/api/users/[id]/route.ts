import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse, IUser } from '@/types';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/users/[id]
export async function GET(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('organizationId', 'name')
      .lean();

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IUser>>({
      success: true,
      data: user as IUser,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]
export async function PUT(request: NextRequest, context: Params) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = await context.params;

    // Don't allow password update through this endpoint
    delete body.password;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('organizationId', 'name')
      .lean();

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IUser>>({
      success: true,
      data: user as IUser,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
