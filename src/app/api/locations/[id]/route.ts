import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const location = await Location.findById(params.id).populate('parentId', 'name type code').lean();
    if (!location) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const location = await Location.findByIdAndUpdate(params.id, body, { new: true });
    if (!location) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const location = await Location.findByIdAndDelete(params.id);
    if (!location) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Location deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
