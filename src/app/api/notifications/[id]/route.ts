import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: notification });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
