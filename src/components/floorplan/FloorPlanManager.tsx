'use client';

import React, { useState, useEffect } from 'react';
import { IFloorPlan, ILocation, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FloorPlanUploader } from './FloorPlanUploader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FloorPlanManagerProps {
  organizationId: string;
}

export function FloorPlanManager({ organizationId }: FloorPlanManagerProps) {
  const [floorPlans, setFloorPlans] = useState<IFloorPlan[]>([]);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    locationId: '',
    scale: 1,
  });

  useEffect(() => {
    fetchFloorPlans();
    fetchLocations();
  }, [organizationId]);

  const fetchFloorPlans = async () => {
    try {
      const response = await fetch(
        `/api/floorplans?organizationId=${organizationId}`
      );
      const result = await response.json();
      if (result.data) {
        setFloorPlans(result.data);
      }
    } catch (error) {
      console.error('Error fetching floor plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `/api/locations?organizationId=${organizationId}&type=floor,building`
      );
      const result = await response.json();
      if (result.data) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleUploadComplete = (data: any) => {
    setUploadedData(data);
  };

  const handleCreateFloorPlan = async () => {
    if (!uploadedData || !formData.name || !formData.locationId) {
      alert('Please fill in all required fields and upload an image');
      return;
    }

    try {
      const response = await fetch('/api/floorplans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          locationId: formData.locationId,
          organizationId,
          imageUrl: uploadedData.url,
          imageWidth: uploadedData.imageWidth,
          imageHeight: uploadedData.imageHeight,
          scale: formData.scale,
          metadata: {
            fileType: uploadedData.fileType,
            fileSize: uploadedData.fileSize,
            originalFileName: uploadedData.originalFileName,
          },
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setIsCreateDialogOpen(false);
        setUploadedData(null);
        setFormData({ name: '', locationId: '', scale: 1 });
        fetchFloorPlans();
      } else {
        alert(result.error || 'Failed to create floor plan');
      }
    } catch (error: any) {
      console.error('Error creating floor plan:', error);
      alert(error.message || 'Failed to create floor plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this floor plan?')) return;

    try {
      const response = await fetch(`/api/floorplans/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        fetchFloorPlans();
      } else {
        alert(result.error || 'Failed to delete floor plan');
      }
    } catch (error: any) {
      console.error('Error deleting floor plan:', error);
      alert(error.message || 'Failed to delete floor plan');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading floor plans...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Floor Plans</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Floor Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Floor Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Floor Plan Name*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Main Office - Floor 2"
                />
              </div>

              <div>
                <Label htmlFor="location">Location*</Label>
                <Select
                  value={formData.locationId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, locationId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem
                        key={location._id as string}
                        value={location._id as string}
                      >
                        {location.name} ({location.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scale">Scale (pixels per meter)</Label>
                <Input
                  id="scale"
                  type="number"
                  value={formData.scale}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, scale: parseFloat(e.target.value) })
                  }
                  min="0.1"
                  step="0.1"
                />
              </div>

              <FloorPlanUploader
                organizationId={organizationId}
                onUploadComplete={handleUploadComplete}
                onError={(error) => alert(error)}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFloorPlan}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Floor Plans Grid */}
      {floorPlans.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No floor plans yet</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Your First Floor Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floorPlans.map((floorPlan) => (
            <div
              key={floorPlan._id as string}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={floorPlan.imageUrl}
                alt={floorPlan.name}
                className="w-full h-48 object-cover bg-gray-100"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{floorPlan.name}</h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>
                    Dimensions: {floorPlan.imageWidth} × {floorPlan.imageHeight}px
                  </p>
                  {floorPlan.scale && <p>Scale: {floorPlan.scale} px/m</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      (window.location.href = `/floorplan/${floorPlan._id}`)
                    }
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      (window.location.href = `/floorplan/${floorPlan._id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(floorPlan._id as string)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
