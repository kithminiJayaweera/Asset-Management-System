/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AssetRequest from '@/models/AssetRequest';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { ApiResponse } from '@/types';

// POST /api/requests/seed - Generate dummy asset requests
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get the first organization and employees for dummy data
    const organization = await Organization.findOne().lean();
    if (!organization) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No organization found. Please create an organization first.' },
        { status: 404 }
      );
    }

    // Get employees from this organization
    const employees = await User.find({ 
      organizationId: organization._id,
      role: 'employee' 
    }).limit(5).lean();

    if (employees.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No employees found. Please create employees first.' },
        { status: 404 }
      );
    }

    // Dummy asset request data
    const dummyRequests = [
      {
        employeeId: employees[0]._id,
        assetName: 'Dell Laptop XPS 15',
        category: 'PC/Laptop',
        quantity: 1,
        reason: 'Need a new laptop for software development work. Current laptop is outdated and slow.',
        priority: 'high',
        status: 'pending',
        organizationId: organization._id,
      },
      {
        employeeId: employees[1 % employees.length]._id,
        assetName: 'Standing Desk',
        category: 'Office Furniture',
        quantity: 1,
        reason: 'Requesting ergonomic standing desk to improve posture and health.',
        priority: 'medium',
        status: 'pending',
        organizationId: organization._id,
      },
      {
        employeeId: employees[2 % employees.length]._id,
        assetName: 'iPhone 15 Pro',
        category: 'Electronics',
        quantity: 1,
        reason: 'Need a company phone for client communications and on-call support.',
        priority: 'medium',
        status: 'approved',
        organizationId: organization._id,
        approvedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        employeeId: employees[3 % employees.length]._id,
        assetName: 'Herman Miller Chair',
        category: 'Office Furniture',
        quantity: 1,
        reason: 'Current chair is causing back pain. Need ergonomic office chair.',
        priority: 'high',
        status: 'pending',
        organizationId: organization._id,
      },
      {
        employeeId: employees[4 % employees.length]._id,
        assetName: 'External 4K Monitor',
        category: 'Electronics',
        quantity: 2,
        reason: 'Need dual monitors for better productivity in design work.',
        priority: 'medium',
        status: 'rejected',
        rejectionReason: 'Budget constraints. Will reconsider in next quarter.',
        organizationId: organization._id,
      },
      {
        employeeId: employees[0]._id,
        assetName: 'MacBook Pro M3',
        category: 'PC/Laptop',
        quantity: 1,
        reason: 'Need MacBook for iOS app development project.',
        priority: 'high',
        status: 'approved',
        organizationId: organization._id,
        approvedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        employeeId: employees[1 % employees.length]._id,
        assetName: 'Wireless Keyboard & Mouse',
        category: 'Electronics',
        quantity: 1,
        reason: 'Current keyboard and mouse are malfunctioning.',
        priority: 'low',
        status: 'pending',
        organizationId: organization._id,
      },
      {
        employeeId: employees[2 % employees.length]._id,
        assetName: 'Office Desk Lamp',
        category: 'Office Furniture',
        quantity: 1,
        reason: 'Need better lighting for late evening work.',
        priority: 'low',
        status: 'approved',
        organizationId: organization._id,
        approvedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    // Clear existing dummy data (optional - comment out if you want to keep adding)
    // await AssetRequest.deleteMany({ organizationId: organization._id });

    // Insert dummy requests
    const createdRequests = await AssetRequest.insertMany(dummyRequests);

    return NextResponse.json<ApiResponse>(
      { 
        success: true, 
        data: createdRequests,
        message: `Successfully created ${createdRequests.length} dummy asset requests` 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error seeding requests:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to seed requests' },
      { status: 500 }
    );
  }
}

// GET /api/requests/seed - Get info about seeding
export async function GET() {
  return NextResponse.json({
    message: 'Asset Request Seed Endpoint',
    usage: 'Send a POST request to this endpoint to generate dummy asset requests',
    note: 'Make sure you have at least one organization and some employees created first',
  });
}
