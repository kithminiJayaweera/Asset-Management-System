import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse, IUser } from '@/types';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};
    
    if (organizationId) query.organizationId = organizationId;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json<ApiResponse<IUser[]>>({
      success: true,
      data: users as IUser[],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
    console.error('Error fetching users:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const user = await User.create(body);

    // Remove password from response using destructuring
    const userObject = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = userObject;

    return NextResponse.json<ApiResponse<IUser>>(
      { success: true, data: userWithoutPassword as IUser, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    console.error('Error creating user:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
