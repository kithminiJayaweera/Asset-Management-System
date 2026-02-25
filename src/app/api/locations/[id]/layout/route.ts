import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.log('=== API GET LAYOUT ===');
    console.log('Location ID:', id);
    
    const location = await Location.findById(id);
    if (!location) {
      console.log('Location not found');
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    console.log('Retrieved layout:', JSON.stringify(location.floorPlanLayout, null, 2));
    console.log('Layout length:', location.floorPlanLayout?.length || 0);
    console.log('=== API GET COMPLETE ===');
    return NextResponse.json({ layout: location.floorPlanLayout || [] });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json({ error: 'Failed to load layout' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { layout } = await req.json();
    console.log('=== API PUT LAYOUT ===');
    console.log('Location ID:', id);
    console.log('Layout to save:', JSON.stringify(layout, null, 2));
    
    const location = await Location.findByIdAndUpdate(
      id,
      { $set: { floorPlanLayout: layout } },
      { new: true, runValidators: false }
    );
    
    if (!location) {
      console.log('Location not found');
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    console.log('Saved layout:', JSON.stringify(location.floorPlanLayout, null, 2));
    console.log('Layout saved successfully with', location.floorPlanLayout?.length || 0, 'items');
    console.log('=== API PUT COMPLETE ===');
    return NextResponse.json({ success: true, layout: location.floorPlanLayout });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save layout' }, { status: 500 });
  }
}
