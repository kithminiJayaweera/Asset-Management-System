import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    await dbConnect();
    const user = await User.findById(payload.userId)
      .populate('organizationId', 'name address')
      .select('-password');

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
