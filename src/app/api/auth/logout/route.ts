import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    // Mark session as inactive in database
    if (token) {
      await Session.updateOne(
        { token },
        { isActive: false }
      );
    }

    // Clear the auth token cookie
    const response = NextResponse.json<ApiResponse>(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    );

    response.cookies.delete('auth-token');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
