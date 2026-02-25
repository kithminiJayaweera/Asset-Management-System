import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Building from '@/models/Building';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    
    const query = organizationId ? { organizationId, isActive: true } : { isActive: true };
    const buildings = await Building.find(query).populate('organizationId', 'name code').sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: buildings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const building = await Building.create(body);
    return NextResponse.json({ success: true, data: building }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
