import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FloorPlan from '@/models/FloorPlan';
import { ApiResponse, PaginatedResponse, IFloorPlan } from '@/types';

/**
 * GET /api/floorplans
 * Retrieve all floor plans with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const locationId = searchParams.get('locationId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};
    if (organizationId) query.organizationId = organizationId;
    if (locationId) query.locationId = locationId;
    if (isActive !== null) query.isActive = isActive === 'true';

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [floorPlans, total] = await Promise.all([
      FloorPlan.find(query)
        .populate('locationId', 'name type')
        .populate('organizationId', 'name')
        .populate('metadata.uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FloorPlan.countDocuments(query),
    ]);

    const response: PaginatedResponse<IFloorPlan> = {
      data: floorPlans as IFloorPlan[],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching floor plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch floor plans' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/floorplans
 * Create a new floor plan
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      name, 
      locationId, 
      organizationId, 
      imageUrl, 
      imageWidth, 
      imageHeight, 
      scale,
      metadata 
    } = body;

    // Validate required fields
    if (!name || !locationId || !organizationId || !imageUrl || !imageWidth || !imageHeight) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      );
    }

    // Create floor plan
    const floorPlan = await FloorPlan.create({
      name,
      locationId,
      organizationId,
      imageUrl,
      imageWidth,
      imageHeight,
      scale: scale || 1,
      metadata,
      isActive: true,
    });

    const populatedFloorPlan = await FloorPlan.findById(floorPlan._id)
      .populate('locationId', 'name type')
      .populate('organizationId', 'name')
      .lean();

    return NextResponse.json(
      { success: true, data: populatedFloorPlan } as ApiResponse<IFloorPlan>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating floor plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create floor plan' } as ApiResponse,
      { status: 500 }
    );
  }
}
