import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, password, organizationId } = await request.json();

    if (!name || !email || !password || !organizationId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    const user = new User({
      name,
      email,
      password,
      organizationId,
      role: 'employee'
    });

    await user.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}