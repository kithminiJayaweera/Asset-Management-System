import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import '@/models'; // Import all models
import Asset from '@/models/Asset';
import AssetRequest from '@/models/AssetRequest';
import Notification from '@/models/Notification';
import AuditLog from '@/models/AuditLog';
import { ApiResponse, IAsset } from '@/types';
import { emitNotification, broadcastNotification, emitAssetUpdate } from '@/lib/socket';
import mongoose from 'mongoose';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/assets/[id] - Get a specific asset
export async function GET(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid asset ID' },
        { status: 400 }
      );
    }

    const asset = await Asset.findById(id)
      .populate('assignedTo', 'name email department position')
      .populate('organizationId', 'name')
      .lean();

    if (!asset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IAsset>>({
      success: true,
      data: asset as IAsset,
    });
  } catch (error: any) {
    console.error('Error fetching asset:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PUT /api/assets/[id] - Update an asset
export async function PUT(request: NextRequest, context: Params) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid asset ID' },
        { status: 400 }
      );
    }

    console.log('Updating asset:', id, 'with data:', body);

    // Get old asset data BEFORE update
    const oldAsset = await Asset.findById(id).select('assignedTo name status').lean();
    if (!oldAsset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Validation: Cannot assign retired/lost/maintenance assets
    if (body.assignedTo && (body.status === 'retired' || body.status === 'lost' || body.status === 'maintenance' || oldAsset.status === 'retired' || oldAsset.status === 'lost' || oldAsset.status === 'maintenance')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: `Cannot assign ${body.status || oldAsset.status} assets` },
        { status: 400 }
      );
    }

    const previousAssignee = oldAsset.assignedTo?.toString();

    const asset = await Asset.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('organizationId', 'name')
      .lean();

    if (!asset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    console.log('Asset updated:', { _id: asset._id, status: asset.status, assignedTo: asset.assignedTo });

    // Broadcast update notification
    try {
      await Notification.create({
        userId: 'admin',
        type: 'asset_updated',
        title: 'Asset Updated',
        message: `${asset.name} has been updated`,
        data: { assetId: asset._id },
      });
      const updateNotif = {
        _id: Date.now().toString(),
        type: 'asset_updated',
        title: 'Asset Updated',
        message: `${asset.name} has been updated`,
        read: false,
        createdAt: new Date(),
      };
      broadcastNotification(updateNotif);
      emitAssetUpdate();
    } catch (notifError) {
      console.error('Error broadcasting notification:', notifError);
    }

    // Handle assignment changes
    if (body.assignedTo !== undefined) {
      if (body.assignedTo) {
        const approvedRequest = await AssetRequest.findOne({
          requestedBy: body.assignedTo,
          status: 'approved',
          $or: [
            { assetId: id },
            { assetId: null, assetCategory: asset.category }
          ]
        }).sort({ createdAt: -1 });

        if (approvedRequest && !approvedRequest.assetId) {
          await AssetRequest.findByIdAndUpdate(approvedRequest._id, {
            assetId: id
          });
        }

        // Notify previous assignee if reassigning
        if (previousAssignee && previousAssignee !== body.assignedTo.toString()) {
          try {
            await Notification.updateMany(
              { userId: previousAssignee, 'data.assetId': id, type: 'asset_assigned' },
              { $set: { read: true } }
            );
            await Notification.create({
              userId: previousAssignee,
              type: 'asset_updated',
              title: 'Asset Unassigned',
              message: `${asset.name} has been reassigned to another user`,
              data: { assetId: id },
            });
            const unassignNotif = {
              _id: Date.now().toString(),
              type: 'asset_updated',
              title: 'Asset Unassigned',
              message: `${asset.name} has been reassigned`,
              read: false,
              createdAt: new Date(),
            };
            emitNotification(previousAssignee, unassignNotif);
          } catch (notifError) {
            console.error('Error notifying previous assignee:', notifError);
          }
        }

        // Notify new assignee
        try {
          const assignedUser = await Asset.findById(id).populate('assignedTo', 'name').lean();
          const assignedUserName = assignedUser?.assignedTo?.name || 'User';
          
          console.log('Creating audit log for assignment:', { assetId: id, userName: assignedUserName });
          
          const auditLog = await AuditLog.create({
            entityType: 'asset',
            entityId: id,
            action: `Assigned to ${assignedUserName}`,
            performedBy: body.assignedTo,
            changes: { assignedTo: body.assignedTo },
          });
          
          console.log('Audit log created:', auditLog);
          
          await Notification.create({
            userId: body.assignedTo.toString(),
            type: 'asset_assigned',
            title: 'Asset Assigned',
            message: `${asset.name} has been assigned to you`,
            data: { assetId: id },
          });
          const assignNotif = {
            _id: Date.now().toString(),
            type: 'asset_assigned',
            title: 'Asset Assigned',
            message: `${asset.name} has been assigned`,
            read: false,
            createdAt: new Date(),
          };
          emitNotification(body.assignedTo.toString(), assignNotif);
        } catch (notifError) {
          console.error('Error creating assignment notification:', notifError);
        }
      } else {
        // Asset unassigned completely
        if (previousAssignee) {
          try {
            console.log('Creating audit log for unassignment:', { assetId: id, previousAssignee });
            
            const auditLog = await AuditLog.create({
              entityType: 'asset',
              entityId: id,
              action: 'Asset unassigned',
              performedBy: previousAssignee,
              changes: { assignedTo: null },
            });
            
            console.log('Unassignment audit log created:', auditLog);
            
            await Notification.updateMany(
              { userId: previousAssignee, 'data.assetId': id, type: 'asset_assigned' },
              { $set: { read: true } }
            );
            await Notification.create({
              userId: previousAssignee,
              type: 'asset_updated',
              title: 'Asset Unassigned',
              message: `${asset.name} has been unassigned from you`,
              data: { assetId: id },
            });
            const unassignNotif = {
              _id: Date.now().toString(),
              type: 'asset_updated',
              title: 'Asset Unassigned',
              message: `${asset.name} has been unassigned`,
              read: false,
              createdAt: new Date(),
            };
            emitNotification(previousAssignee, unassignNotif);
          } catch (notifError) {
            console.error('Error notifying unassignment:', notifError);
          }
        }
        await AssetRequest.updateMany(
          { assetId: id },
          { $set: { assetId: null } }
        );
      }
    }

    return NextResponse.json<ApiResponse<IAsset>>({
      success: true,
      data: asset as IAsset,
      message: 'Asset updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating asset:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/[id] - Delete an asset
export async function DELETE(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid asset ID' },
        { status: 400 }
      );
    }

    const asset = await Asset.findByIdAndDelete(id);

    if (!asset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Broadcast delete notification
    try {
      const deleteNotif = {
        _id: Date.now().toString(),
        type: 'asset_updated',
        title: 'Asset Deleted',
        message: `${asset.name} has been deleted from inventory`,
        read: false,
        createdAt: new Date(),
      };
      broadcastNotification(deleteNotif);
      emitAssetUpdate();
    } catch (notifError) {
      console.error('Error broadcasting delete notification:', notifError);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
