import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import { ApiResponse, IOrganization } from '@/types';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/organizations/[id]
export async function GET(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const organization = await Organization.findById(id).lean();

    if (!organization) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IOrganization>>({
      success: true,
      data: organization as IOrganization,
    });
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id]
export async function PUT(request: NextRequest, context: Params) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = await context.params;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!organization) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IOrganization>>({
      success: true,
      data: organization as IOrganization,
      message: 'Organization updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]
export async function DELETE(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const organization = await Organization.findByIdAndDelete(id);

    if (!organization) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
