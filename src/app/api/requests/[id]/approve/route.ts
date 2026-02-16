import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AssetService } from '@/services/asset.service';
import { handleError } from '@/lib/errors';
import { apiRateLimit } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();

    const { assetId } = await request.json();
    const performedBy = 'admin';

    const result = await AssetService.approveRequestAndAssign(params.id, assetId, performedBy);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Request approved and asset assigned successfully'
    });
  } catch (error) {
    return handleError(error);
  }
}
