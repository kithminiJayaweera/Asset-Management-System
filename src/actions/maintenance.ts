'use server';

import connectDB from '@/lib/mongodb';
import Maintenance from '@/models/Maintenance';
import Asset from '@/models/Asset';
import AuditLog from '@/models/AuditLog';
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
  performedBy?: string;
}) {
  try {
    await connectDB();

    const asset = await Asset.findById(data.assetId);
    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }

    // ✅ Rule 1: Only active assets can go to maintenance
    if (asset.status !== 'active') {
      return { 
        success: false, 
        error: `Cannot send ${asset.status} asset to maintenance. Only active assets can be sent to maintenance.` 
      };
    }

    // ✅ Step 1: Create Maintenance Record
    const maintenance = await Maintenance.create({
      ...data,
      status: 'pending',
      expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : undefined,
      organizationId: data.organizationId || asset.organizationId,
    });

    // ✅ Step 2: Update Asset - Set to maintenance + track start date
    asset.status = 'maintenance';
    asset.maintenance = {
      ...asset.maintenance,
      maintenanceStartDate: new Date(),
      expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : undefined,
    };
    await asset.save();

    // Create audit log
    try {
      await AuditLog.create({
        entityType: 'asset',
        entityId: data.assetId,
        action: 'Sent to Maintenance',
        performedBy: data.performedBy || 'system',
        changes: {
          maintenanceId: maintenance._id,
          status: 'maintenance',
          maintenanceType: data.maintenanceType,
          priority: data.priority,
        },
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
    }

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
      .populate('assetId', 'name assetTag status')
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(records)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMaintenanceStatus(
  maintenanceId: string,
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'closed',
  updates?: {
    actualCost?: number;
    performedBy?: string;
    notes?: string;
    assetCondition?: 'excellent' | 'good' | 'fair' | 'poor';
    assetFinalStatus?: 'active' | 'lost' | 'retired';
  }
) {
  try {
    await connectDB();

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return { success: false, error: 'Maintenance record not found' };
    }

    const asset = await Asset.findById(maintenance.assetId);
    if (!asset) {
      return { success: false, error: 'Associated asset not found' };
    }

    // ✅ When maintenance is completed
    if (status === 'completed') {
      maintenance.status = 'completed';
      maintenance.completionDate = new Date();
      if (updates?.actualCost !== undefined) maintenance.actualCost = updates.actualCost;
      if (updates?.performedBy !== undefined) maintenance.performedBy = updates.performedBy;
      if (updates?.notes !== undefined) maintenance.notes = updates.notes;

      // ✅ Step 2 Part of 4: Update Asset Back to Active
      asset.status = 'active';
      asset.maintenance = {
        ...asset.maintenance,
        lastMaintenanceDate: new Date(),
        maintenanceStartDate: undefined,
        expectedReturnDate: undefined,
        condition: updates?.assetCondition || asset.maintenance.condition,
      };

      // Create audit log
      try {
        await AuditLog.create({
          entityType: 'asset',
          entityId: maintenance.assetId.toString(),
          action: 'Maintenance Completed',
          performedBy: updates?.performedBy || 'system',
          changes: {
            maintenanceId,
            status: 'completed',
            actualCost: updates?.actualCost,
          },
        });
      } catch (auditError) {
        console.error('Error creating audit log:', auditError);
      }
    }
    // ✅ When maintenance is closed with lost/retired scenario
    else if (status === 'closed') {
      maintenance.status = 'closed';
      maintenance.completionDate = new Date();

      // Handle lost asset during maintenance
      if (updates?.assetFinalStatus === 'lost') {
        asset.status = 'lost';
        maintenance.notes = (maintenance.notes || '') + '\n[LOST DURING MAINTENANCE]';
      }
      // Handle asset beyond repair
      else if (updates?.assetFinalStatus === 'retired') {
        asset.status = 'retired';
        maintenance.notes = (maintenance.notes || '') + '\n[RETIRED - BEYOND REPAIR]';
      }

      // Clear maintenance dates
      asset.maintenance = {
        ...asset.maintenance,
        maintenanceStartDate: undefined,
        expectedReturnDate: undefined,
      };

      // Create audit log
      try {
        await AuditLog.create({
          entityType: 'asset',
          entityId: maintenance.assetId.toString(),
          action: 'Maintenance Closed',
          performedBy: updates?.performedBy || 'system',
          changes: {
            maintenanceId,
            status: 'closed',
            assetFinalStatus: updates?.assetFinalStatus,
          },
        });
      } catch (auditError) {
        console.error('Error creating audit log:', auditError);
      }
    }
    // Handle other status updates
    else if (status === 'in-progress' || status === 'pending' || status === 'cancelled') {
      maintenance.status = status;
      if (updates?.notes !== undefined) maintenance.notes = updates.notes;

      try {
        await AuditLog.create({
          entityType: 'asset',
          entityId: maintenance.assetId.toString(),
          action: `Maintenance ${status}`,
          performedBy: updates?.performedBy || 'system',
          changes: {
            maintenanceId,
            status,
          },
        });
      } catch (auditError) {
        console.error('Error creating audit log:', auditError);
      }
    }

    await maintenance.save();
    await asset.save();

    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(maintenance)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
