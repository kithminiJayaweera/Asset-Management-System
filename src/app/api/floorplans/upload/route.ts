import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const floorId = formData.get('floorId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PNG, JPG, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'floorplans');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-');
    const filename = `${floorId}-${timestamp}-${originalName}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/floorplans/${filename}`;

    // Optionally update the location record with the image URL
    if (floorId) {
      await dbConnect();
      await Location.findByIdAndUpdate(floorId, {
        $set: { 'metadata.floorplanImageUrl': publicUrl }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve floor plan metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const floorId = searchParams.get('floorId');

    if (!floorId) {
      return NextResponse.json(
        { success: false, error: 'floorId is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const floor = await Location.findById(floorId).lean();

    if (!floor) {
      return NextResponse.json(
        { success: false, error: 'Floor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        floorplanImageUrl: floor.metadata?.floorplanImageUrl || null,
        gridData: floor.gridData || null
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
