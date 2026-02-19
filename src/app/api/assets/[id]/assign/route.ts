import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { AssetService } from '@/services/asset.service';
import { apiRateLimit } from '@/lib/rate-limit';

// POST /api/assets/[id]/assign - Assign asset to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();

    const { userId } = await request.json();
    const performedBy = 'admin';

    const asset = await AssetService.assignAsset(id, userId, performedBy);

    return NextResponse.json({
      success: true,
      data: asset,
      message: 'Asset assigned successfully'
    });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/assets/[id]/assign - Unassign asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();

    const performedBy = 'admin';
    const asset = await AssetService.unassignAsset(id, performedBy);

    return NextResponse.json({
      success: true,
      data: asset,
      message: 'Asset unassigned successfully'
    });
  } catch (error) {
    return handleError(error);
  }
}
