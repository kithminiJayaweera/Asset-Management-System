import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, organizationId, role } = body;

    // Validate required fields
    if (!name || !email || !password || !organizationId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Name, email, password, and organization are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user (default role is employee)
    const user = await User.create({
      name,
      email,
      password,
      organizationId,
      role: role || 'employee',
      department: body.department || '',
      position: body.position || '',
      employeeId: body.employeeId || '',
    });

    // Generate JWT token
    const token = signToken(user);

    // Create response with user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      department: user.department,
      position: user.position,
    };

    // Set HTTP-only cookie
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: userData,
        message: 'Registration successful',
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
