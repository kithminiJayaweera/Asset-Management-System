import Asset from '@/models/Asset';
import AuditLog from '@/models/AuditLog';
import AssetRequest from '@/models/AssetRequest';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export class AssetService {
  static async assignAsset(assetId: string, employeeId: string, performedBy: string) {
    const asset = await Asset.findById(assetId);
    
    if (!asset) throw new ValidationError('Asset not found');
    if (asset.status === 'retired' || asset.status === 'lost') {
      throw new ValidationError(`Cannot assign ${asset.status} assets`);
    }
    if (asset.assignedTo) throw new ValidationError('Asset is already assigned');

    const previousState = { assignedTo: asset.assignedTo };
    asset.assignedTo = employeeId;
    await asset.save();

    await AuditLog.create({
      entityType: 'asset',
      entityId: assetId,
      action: 'assigned',
      performedBy,
      changes: { before: previousState, after: { assignedTo: employeeId } }
    });

    logger.info('Asset assigned', { assetId, employeeId });
    return asset;
  }

  static async unassignAsset(assetId: string, performedBy: string) {
    const asset = await Asset.findById(assetId);
    
    if (!asset) throw new ValidationError('Asset not found');
    if (!asset.assignedTo) throw new ValidationError('Asset is not assigned');

    const previousState = { assignedTo: asset.assignedTo };
    asset.assignedTo = null;
    await asset.save();

    await AuditLog.create({
      entityType: 'asset',
      entityId: assetId,
      action: 'unassigned',
      performedBy,
      changes: { before: previousState, after: { assignedTo: null } }
    });

    logger.info('Asset unassigned', { assetId });
    return asset;
  }

  static async approveRequestAndAssign(requestId: string, assetId: string, performedBy: string) {
    const [request, asset] = await Promise.all([
      AssetRequest.findById(requestId).populate('requestedBy'),
      Asset.findById(assetId)
    ]);

    if (!request || !asset) throw new ValidationError('Request or asset not found');
    if (!request.requestedBy) throw new ValidationError('Request has no requester');
    if (asset.status === 'retired' || asset.status === 'lost') {
      throw new ValidationError(`Cannot assign ${asset.status} assets`);
    }
    if (asset.assignedTo) throw new ValidationError('Asset is already assigned');

    asset.assignedTo = (request.requestedBy as any)._id;
    request.status = 'approved';
    request.assetId = assetId;

    await Promise.all([
      asset.save(),
      request.save(),
      AuditLog.create({
        entityType: 'asset',
        entityId: assetId,
        action: 'assigned_from_request',
        performedBy,
        changes: { requestId, assignedTo: (request.requestedBy as any)._id }
      })
    ]);

    logger.info('Request approved and asset assigned', { requestId, assetId });
    return { asset, request };
  }
}
