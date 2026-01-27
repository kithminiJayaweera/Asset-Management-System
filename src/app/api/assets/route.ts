import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { ApiResponse, PaginatedResponse, IAsset } from '@/types';

// GET /api/assets - Get all assets with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const organizationId = searchParams.get('organizationId');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    
    if (organizationId) query.organizationId = organizationId;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [assets, totalCount] = await Promise.all([
      Asset.find(query)
        .populate('assignedTo', 'name email')
        .populate('organizationId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Asset.countDocuments(query),
    ]);

    const response: PaginatedResponse<IAsset> = {
      data: assets as IAsset[],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<IAsset>>>({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create a new asset
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['assetTag', 'name', 'category', 'purchaseDate', 'purchasePrice', 'organizationId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Set currentValue to purchasePrice if not provided
    if (!body.currentValue) {
      body.currentValue = body.purchasePrice;
    }

    const asset = await Asset.create(body);

    return NextResponse.json<ApiResponse<IAsset>>(
      { success: true, data: asset as IAsset, message: 'Asset created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating asset:', error);
    
    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset tag already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to create asset' },
      { status: 500 }
    );
  }
}
