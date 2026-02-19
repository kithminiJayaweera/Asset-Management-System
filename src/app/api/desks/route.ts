import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Desk from '@/models/Desk';
import { ApiResponse, PaginatedResponse, IDesk } from '@/types';

/**
 * GET /api/desks
 * Retrieve all desks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const floorPlanId = searchParams.get('floorPlanId');
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build query
    const query: any = {};
    if (organizationId) query.organizationId = organizationId;
    if (floorPlanId) query.floorPlanId = floorPlanId;
    if (locationId) query.locationId = locationId;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    query.isActive = true;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [desks, total] = await Promise.all([
      Desk.find(query)
        .populate('locationId', 'name type')
        .populate('floorPlanId', 'name imageUrl')
        .populate('assignedTo', 'name email department')
        .populate('assignedAssets', 'assetTag name status')
        .sort({ deskNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Desk.countDocuments(query),
    ]);

    const response: PaginatedResponse<IDesk> = {
      data: desks as IDesk[],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching desks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch desks' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/desks
 * Create a new desk
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      deskNumber, 
      name,
      locationId, 
      floorPlanId, 
      organizationId, 
      coordinates,
      width,
      height,
      rotation,
      status,
      deskType,
      capacity,
      amenities,
      notes,
    } = body;

    // Validate required fields
    if (!deskNumber || !locationId || !floorPlanId || !organizationId || !coordinates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      );
    }

    // Check for duplicate desk number in the same floor plan
    const existingDesk = await Desk.findOne({ 
      floorPlanId, 
      deskNumber: deskNumber.toUpperCase() 
    });

    if (existingDesk) {
      return NextResponse.json(
        { success: false, error: 'Desk number already exists in this floor plan' } as ApiResponse,
        { status: 400 }
      );
    }

    // Create desk
    const desk = await Desk.create({
      deskNumber: deskNumber.toUpperCase(),
      name,
      locationId,
      floorPlanId,
      organizationId,
      coordinates,
      width: width || 100,
      height: height || 80,
      rotation: rotation || 0,
      status: status || 'available',
      deskType: deskType || 'standard',
      capacity: capacity || 5,
      amenities: amenities || [],
      notes,
      isActive: true,
    });

    const populatedDesk = await Desk.findById(desk._id)
      .populate('locationId', 'name type')
      .populate('floorPlanId', 'name')
      .lean();

    return NextResponse.json(
      { success: true, data: populatedDesk } as ApiResponse<IDesk>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating desk:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create desk' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/desks/bulk
 * Create multiple desks at once
 */
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { desks } = body;

    if (!Array.isArray(desks) || desks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid desks array' } as ApiResponse,
        { status: 400 }
      );
    }

    // Create all desks
    const createdDesks = await Desk.insertMany(
      desks.map(desk => ({
        ...desk,
        deskNumber: desk.deskNumber.toUpperCase(),
        isActive: true,
      })),
      { ordered: false } // Continue on error
    );

    return NextResponse.json(
      { 
        success: true, 
        data: createdDesks,
        message: `Created ${createdDesks.length} desks`
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating desks in bulk:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create desks' } as ApiResponse,
      { status: 500 }
    );
  }
}
