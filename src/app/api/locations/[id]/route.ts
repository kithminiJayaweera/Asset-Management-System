import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const location = await Location.findById(id).populate('parentId', 'name type code').lean();
    if (!location) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const location = await Location.findByIdAndUpdate(id, body, { new: true });
    if (!location) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const location = await Location.findById(id);
    if (!location) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }

    // Cascade delete: find and delete all children
    const deleteChildren = async (parentId: string) => {
      const children = await Location.find({ parentId });
      for (const child of children) {
        await deleteChildren(child._id.toString());
        await Location.findByIdAndDelete(child._id);
      }
    };

    await deleteChildren(id);
    await Location.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Location and all children deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
