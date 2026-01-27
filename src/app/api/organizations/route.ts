import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import { ApiResponse, IOrganization } from '@/types';

// GET /api/organizations - Get all organizations
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const organizations = await Organization.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json<ApiResponse<IOrganization[]>>({
      success: true,
      data: organizations as IOrganization[],
    });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const organization = await Organization.create(body);

    return NextResponse.json<ApiResponse<IOrganization>>(
      { success: true, data: organization as IOrganization, message: 'Organization created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating organization:', error);

    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Organization name or email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to create organization' },
      { status: 500 }
    );
  }
}
