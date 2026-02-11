import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import '@/models'; // Import all models
import Asset from '@/models/Asset';
import AssetRequest from '@/models/AssetRequest';
import Notification from '@/models/Notification';
import { ApiResponse, IAsset } from '@/types';
import { emitNotification, broadcastNotification, emitAssetUpdate } from '@/lib/socket';

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

    console.log('Updating asset:', id, 'with data:', body);

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

    console.log('Asset updated in database:', {
      _id: asset._id,
      status: asset.status,
      assignedTo: asset.assignedTo
    });

    // Broadcast update notification
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

    // If assignedTo is being updated, sync with asset requests
    if (body.assignedTo !== undefined) {
      if (body.assignedTo) {
        // Asset is being assigned
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

        // Notify user about asset assignment
        const notification = await Notification.create({
          userId: body.assignedTo,
          type: 'asset_assigned',
          title: 'Asset Assigned',
          message: `${asset.name} has been assigned to you`,
          data: { assetId: id },
        });
        emitNotification(body.assignedTo, notification);
      } else {
        // Asset is being unassigned
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

    const asset = await Asset.findByIdAndDelete(id);

    if (!asset) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Broadcast delete notification
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

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
