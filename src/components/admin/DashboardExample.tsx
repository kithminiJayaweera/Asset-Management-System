'use client';

import { useState } from 'react';
import { AssetList } from './AssetList';
import { MaintenanceDialog, MaintenanceFormData } from './MaintenanceDialog';
import { Asset, Organization } from '@/types/shared';

interface DashboardProps {
  assets: Asset[];
  organizations: Organization[];
}

export function Dashboard({ assets, organizations }: DashboardProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  const handleSendToMaintenance = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowMaintenanceDialog(true);
  };

  const handleMaintenanceSubmit = async (data: MaintenanceFormData) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('Asset sent to maintenance successfully!');
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to submit maintenance request:', error);
      alert('Failed to submit maintenance request');
    }
  };

  return (
    <>
      <AssetList
        assets={assets}
        organizations={organizations}
        onEdit={(asset) => console.log('Edit:', asset)}
        onDelete={(id) => console.log('Delete:', id)}
        onAddNew={() => console.log('Add new')}
        onViewDetails={(asset) => console.log('View:', asset)}
        onSendToMaintenance={handleSendToMaintenance}
      />

      {showMaintenanceDialog && selectedAsset && (
        <MaintenanceDialog
          asset={selectedAsset}
          onClose={() => {
            setShowMaintenanceDialog(false);
            setSelectedAsset(null);
          }}
          onSubmit={handleMaintenanceSubmit}
        />
      )}
    </>
  );
}
