import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import connectDB from '@/lib/mongodb';
import Asset from '@/models/Asset';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const assetId = formData.get('assetId') as string;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and PDF allowed' }, { status: 400 });
    }

    const result = await uploadToCloudinary(file, 'assets') as any;

    const imageData = {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      isPrimary,
      uploadedAt: new Date(),
    };

    if (assetId) {
      await connectDB();
      const asset = await Asset.findById(assetId);
      
      if (!asset) {
        await deleteFromCloudinary(result.public_id);
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      if (isPrimary) {
        asset.images?.forEach((img: any) => img.isPrimary = false);
      }

      asset.images = asset.images || [];
      asset.images.push(imageData);
      await asset.save();
    }

    return NextResponse.json({ success: true, image: imageData });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');
    const publicId = searchParams.get('publicId');

    if (!assetId || !publicId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await connectDB();
    const asset = await Asset.findById(assetId);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    await deleteFromCloudinary(publicId);
    asset.images = asset.images?.filter((img: any) => img.publicId !== publicId);
    await asset.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
