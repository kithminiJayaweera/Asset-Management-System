import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'disconnected',
    memory: process.memoryUsage(),
  };

  try {
    await dbConnect();
    health.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    health.status = 'unhealthy';
    health.database = 'error';
    return NextResponse.json(health, { status: 503 });
  }
}
