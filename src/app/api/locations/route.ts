import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

// GET /api/locations - Get all locations or filtered by parent
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent') || searchParams.get('parentId');
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');

    const query: any = {};
    if (parentId) query.parentId = parentId === 'null' ? null : parentId;
    if (organizationId) query.organizationId = organizationId;
    if (type) query.type = type;

    const locations = await Location.find(query)
      .populate('parentId', 'name type code')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/locations - Create new location
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const location = await Location.create(body);
    return NextResponse.json({ success: true, data: location }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
