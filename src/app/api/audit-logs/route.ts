import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
