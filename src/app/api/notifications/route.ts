import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { emitNotification } from '@/lib/socket';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const notification = await Notification.create(body);

    emitNotification(body.userId, notification);

    return NextResponse.json({ success: true, data: notification });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    await Notification.deleteMany({ userId });

    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
