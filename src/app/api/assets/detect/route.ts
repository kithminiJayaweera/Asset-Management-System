import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { ApiResponse, IAsset } from '@/types';

// GET /api/assets/detect - Search for assets by serial, model, or manufacturer
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get('serialNumber');
    const model = searchParams.get('model');
    const manufacturer = searchParams.get('manufacturer');
    const category = searchParams.get('category');

    // Build query
    const query: any = {};
    
    if (serialNumber) {
      query.serialNumber = { $regex: serialNumber, $options: 'i' };
    }
    
    if (model) {
      query.model = { $regex: model, $options: 'i' };
    }
    
    if (manufacturer) {
      query.manufacturer = { $regex: manufacturer, $options: 'i' };
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // If no criteria provided, return error
    if (Object.keys(query).length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Please provide at least one search criteria' },
        { status: 400 }
      );
    }

    // Search for matching assets
    const assets = await Asset.find(query)
      .limit(10) // Limit results to avoid overwhelming response
      .select('name category model manufacturer serialNumber purchasePrice currentValue purchaseDate usefulLife depreciationMethod')
      .lean();

    return NextResponse.json<ApiResponse<IAsset[]>>({
      success: true,
      data: assets as IAsset[],
    });
  } catch (error: any) {
    console.error('Error detecting assets:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to detect assets' },
      { status: 500 }
    );
  }
}
