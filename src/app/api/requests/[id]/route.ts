import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import '@/models'; // Import all models
import AssetRequest from '@/models/AssetRequest';
import Asset from '@/models/Asset';
import Notification from '@/models/Notification';
import { ApiResponse, IAssetRequest } from '@/types';
import { emitNotification } from '@/lib/socket';
import { sendEmail, generateRejectionEmail, generateApprovalEmail } from '@/lib/email';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/requests/[id]
export async function GET(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const assetRequest = await AssetRequest.findById(id)
      .populate('requestedBy', 'name email department position employeeId')
      .populate('assetId', 'name assetTag category status assignedTo')
      .populate('approvedBy', 'name email')
      .lean();

    if (!assetRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IAssetRequest>>({
      success: true,
      data: assetRequest as IAssetRequest,
    });
  } catch (error: any) {
    console.error('Error fetching request:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// PUT /api/requests/[id] - Update request (approve/reject)
export async function PUT(request: NextRequest, context: Params) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = await context.params;

    const assetRequest = await AssetRequest.findById(id).populate('requestedBy', 'name email');

    // If approving an assignment request, update asset status
    if (body.status === 'approved') {
      let assignedAsset = null;
      
      console.log('🔍 Processing approval for request type:', assetRequest.requestType);
      console.log('🔍 Asset ID in request:', assetRequest.assetId);
      console.log('🔍 Asset category in request:', assetRequest.assetCategory);
      
      if (assetRequest && assetRequest.requestType === 'assignment') {
        if (assetRequest.assetId) {
          console.log('📋 Assigning specific asset:', assetRequest.assetId);
          // Specific asset requested
          assignedAsset = await Asset.findByIdAndUpdate(assetRequest.assetId, {
            status: 'active',
            assignedTo: assetRequest.requestedBy,
          }, { new: true });
          console.log('✅ Specific asset assigned:', assignedAsset);
        } else if (assetRequest.assetCategory) {
          console.log('🔍 Looking for available asset in category:', assetRequest.assetCategory);
          console.log('🔍 Organization ID:', assetRequest.organizationId);
          
          // First, let's see all assets in this category
          const allCategoryAssets = await Asset.find({
            category: assetRequest.assetCategory,
            organizationId: assetRequest.organizationId
          });
          console.log('📦 All assets in category:', allCategoryAssets.length);
          console.log('📦 Asset statuses:', allCategoryAssets.map(a => ({ name: a.name, status: a.status, tag: a.assetTag })));
          
          // Find available asset from category
          const availableAssets = await Asset.find({
            category: assetRequest.assetCategory,
            status: 'active',
            organizationId: assetRequest.organizationId,
            assignedTo: { $exists: false }
          });
          console.log('📦 Available assets found:', availableAssets.length);
          
          if (availableAssets.length > 0) {
            assignedAsset = await Asset.findOneAndUpdate(
              { 
                category: assetRequest.assetCategory,
                status: 'active',
                organizationId: assetRequest.organizationId,
                assignedTo: { $exists: false }
              },
              {
                status: 'active',
                assignedTo: assetRequest.requestedBy,
              },
              { new: true }
            );
            console.log('✅ Category asset assigned:', assignedAsset);
          } else {
            console.log('⚠️ No available assets found in category');
            // For testing, let's assign the first asset regardless of status
            if (allCategoryAssets.length > 0) {
              console.log('📝 Testing: Assigning first asset regardless of status');
              assignedAsset = await Asset.findByIdAndUpdate(
                allCategoryAssets[0]._id,
                {
                  status: 'active',
                  assignedTo: assetRequest.requestedBy,
                },
                { new: true }
              );
              console.log('✅ Test asset assigned:', assignedAsset);
            }
          }
        }
      }

      body.approvalDate = new Date();

      // Send notification to requester
      const notification = await Notification.create({
        userId: assetRequest.requestedBy._id || assetRequest.requestedBy,
        type: 'request_approved',
        title: 'Request Approved',
        message: `Your ${assetRequest.assetCategory} request has been approved`,
        data: { requestId: id },
      });
      emitNotification(notification.userId, notification);
      
      // Send approval email
      const requesterEmail = assetRequest.requestedBy.email;
      const requesterName = assetRequest.requestedBy.name;
      
      console.log('📧 Preparing approval email for:', requesterEmail);
      console.log('Asset details:', { name: assignedAsset?.name, tag: assignedAsset?.assetTag });
      
      if (requesterEmail) {
        try {
          const emailData = await generateApprovalEmail(
            requesterName,
            assetRequest.assetCategory,
            assignedAsset?.name,
            assignedAsset?.assetTag
          );
          
          console.log('📧 Email HTML generated, sending...');
          const emailSent = await sendEmail({
            to: requesterEmail,
            subject: 'Asset Request Approved - Asset Assigned',
            html: emailData.html,
            attachments: emailData.attachments,
          });
          
          console.log('Approval email sent result:', emailSent);
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
        }
      }
    }

    if (body.status === 'rejected') {
      const rejectionReason = body.notes || 'No reason provided';
      
      console.log('🔴 Processing rejection...');
      console.log('Request:', assetRequest);
      console.log('Requester:', assetRequest.requestedBy);
      
      // Send notification to requester
      const notification = await Notification.create({
        userId: assetRequest.requestedBy._id || assetRequest.requestedBy,
        type: 'request_rejected',
        title: 'Request Rejected',
        message: `Your ${assetRequest.assetCategory} request has been rejected: ${rejectionReason}`,
        data: { requestId: id, reason: rejectionReason },
      });
      emitNotification(notification.userId, notification);

      // Send email to requester
      const requesterEmail = assetRequest.requestedBy.email;
      const requesterName = assetRequest.requestedBy.name;
      
      console.log('📧 Preparing to send email to:', requesterEmail);
      
      if (requesterEmail) {
        const emailHtml = generateRejectionEmail(
          requesterName,
          assetRequest.assetCategory,
          rejectionReason
        );
        
        console.log('📧 Calling sendEmail function...');
        const emailSent = await sendEmail({
          to: requesterEmail,
          subject: 'Asset Request Rejected',
          html: emailHtml,
        });
        
        console.log('Email sent result:', emailSent);
      } else {
        console.log('⚠️ No email address found for requester');
      }
    }

    const updatedRequest = await AssetRequest.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('requestedBy', 'name email department position employeeId')
      .populate('assetId', 'name assetTag category status assignedTo')
      .populate('approvedBy', 'name email')
      .lean();

    if (!updatedRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IAssetRequest>>({
      success: true,
      data: updatedRequest as IAssetRequest,
      message: 'Request updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating request:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE /api/requests/[id]
export async function DELETE(request: NextRequest, context: Params) {
  try {
    await dbConnect();
    
    const { id } = await context.params;

    const assetRequest = await AssetRequest.findByIdAndDelete(id);

    if (!assetRequest) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting request:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to delete request' },
      { status: 500 }
    );
  }
}
