// Server Actions for Asset Requests
'use server';

import dbConnect from '@/lib/mongodb';
import AssetRequest from '@/models/AssetRequest';
import Asset from '@/models/Asset';
import { revalidatePath } from 'next/cache';
import { IAssetRequest } from '@/types';

export async function getRequests(filters: {
  organizationId?: string;
  requestedBy?: string;
  status?: string;
}) {
  try {
    await dbConnect();
    
    const query: any = {};
    if (filters.organizationId) query.organizationId = filters.organizationId;
    if (filters.requestedBy) query.requestedBy = filters.requestedBy;
    if (filters.status) query.status = filters.status;
    
    const requests = await AssetRequest.find(query)
      .populate('requestedBy', 'name email department')
      .populate('assetId', 'name assetTag')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(requests));
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw new Error('Failed to fetch requests');
  }
}

export async function createRequest(data: Partial<IAssetRequest>) {
  try {
    await dbConnect();
    
    const request = await AssetRequest.create(data);
    
    revalidatePath('/admin/requests');
    revalidatePath('/employee/requests');
    
    return JSON.parse(JSON.stringify(request));
  } catch (error) {
    console.error('Error creating request:', error);
    throw new Error('Failed to create request');
  }
}

export async function approveRequest(id: string, approvedBy: string) {
  try {
    await dbConnect();
    
    const request = await AssetRequest.findById(id);
    
    if (!request) {
      throw new Error('Request not found');
    }
    
    // If it's an assignment request, update the asset
    if (request.requestType === 'assignment' && request.assetId) {
      await Asset.findByIdAndUpdate(request.assetId, {
        status: 'assigned',
        assignedTo: request.requestedBy,
      });
    }
    
    const updatedRequest = await AssetRequest.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy,
        approvalDate: new Date(),
      },
      { new: true }
    )
      .populate('requestedBy', 'name email')
      .populate('assetId', 'name assetTag')
      .lean();
    
    revalidatePath('/admin/requests');
    revalidatePath('/employee/requests');
    
    return JSON.parse(JSON.stringify(updatedRequest));
  } catch (error) {
    console.error('Error approving request:', error);
    throw new Error('Failed to approve request');
  }
}

export async function rejectRequest(id: string, approvedBy: string, notes?: string) {
  try {
    await dbConnect();
    
    const updatedRequest = await AssetRequest.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        approvedBy,
        approvalDate: new Date(),
        notes,
      },
      { new: true }
    )
      .populate('requestedBy', 'name email')
      .populate('assetId', 'name assetTag')
      .lean();
    
    revalidatePath('/admin/requests');
    revalidatePath('/employee/requests');
    
    return JSON.parse(JSON.stringify(updatedRequest));
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw new Error('Failed to reject request');
  }
}
