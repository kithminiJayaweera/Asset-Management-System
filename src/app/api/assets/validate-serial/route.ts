import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { ApiResponse } from '@/types';

// GET /api/assets/validate-serial - Check if serial number is unique
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get('serialNumber');
    const excludeId = searchParams.get('excludeId');

    if (!serialNumber) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Serial number is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { 
      serialNumber: { $regex: `^${serialNumber}$`, $options: 'i' } 
    };
    
    // Exclude specific asset ID if provided (for update scenarios)
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // Check if asset exists
    const existingAsset = await Asset.findOne(query)
      .select('assetTag name category model manufacturer serialNumber')
      .lean();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        exists: !!existingAsset,
        asset: existingAsset || null
      },
    });
  } catch (error: any) {
    console.error('Error validating serial number:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to validate serial number' },
      { status: 500 }
    );
  }
}
