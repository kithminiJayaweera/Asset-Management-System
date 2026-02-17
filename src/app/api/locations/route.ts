import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const parentId = searchParams.get('parentId');
    
    const query: any = {};
    if (organizationId) query.organizationId = organizationId;
    if (parentId !== null) {
      query.parentId = parentId === 'null' ? null : parentId;
    }
    
    const locations = await Location.find(query).sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const location = await Location.create(body);
    
    return NextResponse.json({ success: true, data: location }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
