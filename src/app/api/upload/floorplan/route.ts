import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ApiResponse } from '@/types';

/**
 * POST /api/upload/floorplan
 * Upload floor plan image file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' } as ApiResponse,
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organization ID is required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only PNG, JPEG, and PDF files are allowed.' 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File size exceeds 10MB limit' 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `floorplan_${organizationId}_${timestamp}_${originalName}`;

    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'floorplans');
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/floorplans/${filename}`;

    // Get image dimensions if it's an image file
    let imageWidth = 0;
    let imageHeight = 0;

    if (file.type.startsWith('image/')) {
      // For images, we'll need to use an image processing library
      // For now, return default dimensions
      imageWidth = 1920;
      imageHeight = 1080;
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          url: publicUrl,
          filename,
          fileType: file.type,
          fileSize: file.size,
          originalFileName: file.name,
          imageWidth,
          imageHeight,
        }
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading floor plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload floor plan' } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/floorplan
 * Get upload guidelines
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
      maxFileSize: '10MB',
      recommendedDimensions: '1920x1080 or higher',
      supportedFormats: ['PNG', 'JPEG', 'PDF'],
    }
  });
}
