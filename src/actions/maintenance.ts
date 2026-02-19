'use server';

import connectDB from '@/lib/mongodb';
import Maintenance from '@/models/Maintenance';
import Asset from '@/models/Asset';
import { revalidatePath } from 'next/cache';

export async function createMaintenanceRecord(data: {
  assetId: string;
  issueTitle: string;
  issueDescription: string;
  maintenanceType: 'preventive' | 'corrective' | 'warranty';
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedReturnDate?: string;
  assignedVendor?: string;
  estimatedCost?: number;
  notes?: string;
  organizationId?: string;
}) {
  try {
    await connectDB();

    const asset = await Asset.findById(data.assetId);
    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }

    const maintenance = await Maintenance.create({
      ...data,
      status: 'pending',
      expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : undefined,
      organizationId: data.organizationId || asset.organizationId,
    });

    asset.status = 'maintenance';
    await asset.save();

    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(maintenance)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMaintenanceRecords(filters?: {
  assetId?: string;
  organizationId?: string;
  status?: string;
}) {
  try {
    await connectDB();

    const query: any = {};
    if (filters?.assetId) query.assetId = filters.assetId;
    if (filters?.organizationId) query.organizationId = filters.organizationId;
    if (filters?.status) query.status = filters.status;

    const records = await Maintenance.find(query)
      .populate('assetId', 'name assetTag')
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(records)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMaintenanceStatus(
  maintenanceId: string,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled',
  updates?: {
    actualCost?: number;
    completionDate?: Date;
    notes?: string;
  }
) {
  try {
    await connectDB();

    const maintenance = await Maintenance.findByIdAndUpdate(
      maintenanceId,
      { status, ...updates },
      { new: true }
    );

    if (!maintenance) {
      return { success: false, error: 'Maintenance record not found' };
    }

    if (status === 'completed') {
      const asset = await Asset.findById(maintenance.assetId);
      if (asset) {
        asset.status = 'active';
        await asset.save();
      }
    }

    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(maintenance)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
