import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Session from '@/models/Session';
import { signToken } from '@/lib/jwt';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signToken(user);

    // Get user agent and IP address
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    // Save session to database
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000); // 7 days
    await Session.create({
      userId: user._id,
      token,
      userAgent,
      ipAddress,
      isActive: true,
      expiresAt,
    });

    // Create response with user data (exclude password)
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
        message: 'Login successful',
      },
      { status: 200 }
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
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
