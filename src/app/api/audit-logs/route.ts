import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    console.log('Fetching audit logs with query:', { entityType, entityId });

    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('Found audit logs:', logs.length);
    console.log('Audit logs:', logs);

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
