import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse, IUser } from '@/types';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // For demo purposes, return a mock employee
    // In production, you would get user ID from session/JWT
    const mockUser = {
      _id: '678816d3bf3a9d33c8a6f2b2',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'employee',
      employeeId: 'EMP001',
      phone: '+1234567890',
      position: 'Software Developer',
      department: 'IT',
      organizationId: '678816d3bf3a9d33c8a6f2b1',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: mockUser,
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}