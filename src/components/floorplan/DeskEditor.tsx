'use client';

import React, { useState } from 'react';
import { IDesk, IFloorPlan, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeskEditorProps {
  floorPlan: IFloorPlan;
  desk?: IDesk;
  isOpen: boolean;
  onClose: () => void;
  onSave: (desk: IDesk) => void;
  position?: { x: number; y: number };
}

const DESK_TYPES = [
  { value: 'standard', label: 'Standard Desk' },
  { value: 'standing', label: 'Standing Desk' },
  { value: 'collaborative', label: 'Collaborative Space' },
  { value: 'hot-desk', label: 'Hot Desk' },
  { value: 'meeting-room', label: 'Meeting Room' },
];

const DESK_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'unavailable', label: 'Unavailable' },
];

const COMMON_AMENITIES = [
  'Monitor',
  'Phone',
  'Docking Station',
  'Keyboard',
  'Mouse',
  'Charger',
  'Headset',
  'Lamp',
  'Drawer',
  'Whiteboard',
];

export function DeskEditor({
  floorPlan,
  desk,
  isOpen,
  onClose,
  onSave,
  position,
}: DeskEditorProps) {
  const [formData, setFormData] = useState({
    deskNumber: desk?.deskNumber || '',
    name: desk?.name || '',
    coordinates: desk?.coordinates || position || { x: 100, y: 100 },
    width: desk?.width || 100,
    height: desk?.height || 80,
    rotation: desk?.rotation || 0,
    status: desk?.status || 'available',
    deskType: desk?.deskType || 'standard',
    capacity: desk?.capacity || 5,
    amenities: desk?.amenities || [],
    notes: desk?.notes || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!formData.deskNumber) {
      alert('Desk number is required');
      return;
    }

    setSaving(true);

    try {
      const url = desk
        ? `/api/desks/${desk._id}`
        : '/api/desks';
      
      const method = desk ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          locationId: floorPlan.locationId,
          floorPlanId: floorPlan._id,
          organizationId: floorPlan.organizationId,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        onSave(result.data as IDesk);
        onClose();
      } else {
        alert(result.error || 'Failed to save desk');
      }
    } catch (error: any) {
      console.error('Error saving desk:', error);
      alert(error.message || 'Failed to save desk');
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {desk ? 'Edit Desk' : 'Create New Desk'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deskNumber">Desk Number*</Label>
              <Input
                id="deskNumber"
                value={formData.deskNumber}
                onChange={(e) =>
                  setFormData({ ...formData, deskNumber: e.target.value })
                }
                placeholder="e.g., A-101"
              />
            </div>

            <div>
              <Label htmlFor="name">Desk Name (Optional)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Window Desk"
              />
            </div>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="x">X Position (px)</Label>
              <Input
                id="x"
                type="number"
                value={formData.coordinates.x}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: {
                      ...formData.coordinates,
                      x: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="y">Y Position (px)</Label>
              <Input
                id="y"
                type="number"
                value={formData.coordinates.y}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coordinates: {
                      ...formData.coordinates,
                      y: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: parseFloat(e.target.value) })
                }
                min="10"
              />
            </div>

            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: parseFloat(e.target.value) })
                }
                min="10"
              />
            </div>

            <div>
              <Label htmlFor="rotation">Rotation (°)</Label>
              <Input
                id="rotation"
                type="number"
                value={formData.rotation}
                onChange={(e) =>
                  setFormData({ ...formData, rotation: parseFloat(e.target.value) })
                }
                min="0"
                max="360"
              />
            </div>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Desk Type</Label>
              <Select
                value={formData.deskType}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, deskType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESK_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <Label htmlFor="capacity">Asset Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) })
              }
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of assets that can be assigned to this desk
            </p>
          </div>

          {/* Amenities */}
          <div>
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {COMMON_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="rounded"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Additional notes about this desk"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : desk ? 'Update Desk' : 'Create Desk'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
