import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FloorPlan from '@/models/FloorPlan';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    const query: any = {};
    if (locationId) query.locationId = locationId;

    const floorPlans = await FloorPlan.find(query).populate('locationId', 'name type code').lean();
    return NextResponse.json({ success: true, data: floorPlans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const floorPlan = await FloorPlan.create(body);
    return NextResponse.json({ success: true, data: floorPlan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
