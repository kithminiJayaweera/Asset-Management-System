import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const query: any = {};
    if (organizationId) query.organizationId = organizationId;

    const locations = await Location.find(query).lean();

    // Build tree structure
    const buildTree = (parentId: string | null = null): any[] => {
      return locations
        .filter((loc: any) => {
          const locParentId = loc.parentId ? loc.parentId.toString() : null;
          return locParentId === parentId;
        })
        .map((loc: any) => ({
          ...loc,
          children: buildTree(loc._id.toString())
        }));
    };

    const tree = buildTree(null);
    return NextResponse.json({ success: true, data: tree });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
