'use client';

import React, { useState, useEffect } from 'react';
import { IFloorPlan, IDesk, ApiResponse } from '@/types';
import { FloorPlanCanvas } from './FloorPlanCanvas';
import { DeskEditor } from './DeskEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Save, Grid, Users, Package } from 'lucide-react';

interface FloorPlanEditorProps {
  floorPlanId: string;
}

export function FloorPlanEditor({ floorPlanId }: FloorPlanEditorProps) {
  const [floorPlan, setFloorPlan] = useState<IFloorPlan | null>(null);
  const [desks, setDesks] = useState<IDesk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesk, setSelectedDesk] = useState<IDesk | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newDeskPosition, setNewDeskPosition] = useState<{ x: number; y: number } | undefined>();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
  });

  useEffect(() => {
    fetchFloorPlan();
  }, [floorPlanId]);

  useEffect(() => {
    if (desks.length > 0) {
      calculateStats();
    }
  }, [desks]);

  const fetchFloorPlan = async () => {
    try {
      const response = await fetch(`/api/floorplans/${floorPlanId}`);
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setFloorPlan(result.data.floorPlan || result.data);
        setDesks(result.data.desks || []);
      }
    } catch (error) {
      console.error('Error fetching floor plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: desks.length,
      available: desks.filter((d) => d.status === 'available').length,
      occupied: desks.filter((d) => d.status === 'occupied').length,
      maintenance: desks.filter((d) => d.status === 'maintenance').length,
    };
    setStats(stats);
  };

  const handleDeskClick = (desk: IDesk) => {
    setSelectedDesk(desk);
    setIsEditorOpen(true);
    setNewDeskPosition(undefined);
  };

  const handleDeskMove = async (deskId: string, newPosition: { x: number; y: number }) => {
    try {
      const response = await fetch(`/api/desks/${deskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: newPosition,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Update local state
        setDesks((prev) =>
          prev.map((desk) =>
            desk._id === deskId
              ? { ...desk, coordinates: newPosition }
              : desk
          )
        );
      }
    } catch (error) {
      console.error('Error updating desk position:', error);
    }
  };

  const handleCreateDesk = () => {
    setSelectedDesk(null);
    setNewDeskPosition({ x: 100, y: 100 });
    setIsEditorOpen(true);
  };

  const handleSaveDesk = (desk: IDesk) => {
    if (selectedDesk) {
      // Update existing desk
      setDesks((prev) =>
        prev.map((d) => (d._id === desk._id ? desk : d))
      );
    } else {
      // Add new desk
      setDesks((prev) => [...prev, desk]);
    }
    setIsEditorOpen(false);
    setSelectedDesk(null);
    setNewDeskPosition(undefined);
  };

  const handleDeleteDesk = async (deskId: string) => {
    if (!confirm('Are you sure you want to delete this desk?')) return;

    try {
      const response = await fetch(`/api/desks/${deskId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setDesks((prev) => prev.filter((d) => d._id !== deskId));
        setIsEditorOpen(false);
        setSelectedDesk(null);
      } else {
        alert(result.error || 'Failed to delete desk');
      }
    } catch (error: any) {
      console.error('Error deleting desk:', error);
      alert(error.message || 'Failed to delete desk');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading floor plan...</div>
          <div className="text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  if (!floorPlan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Floor Plan Not Found</h2>
          <p className="text-gray-500 mb-4">
            The requested floor plan could not be loaded.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{floorPlan.name}</h1>
              <p className="text-sm text-gray-600">
                {floorPlan.imageWidth} × {floorPlan.imageHeight}px
                {floorPlan.scale && ` • Scale: ${floorPlan.scale} px/m`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleCreateDesk}>
              <Plus className="w-4 h-4 mr-2" />
              Add Desk
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Grid className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Total Desks</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-green-700">Available</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.available}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Occupied</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{stats.occupied}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Maintenance</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">{stats.maintenance}</div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-6">
        <FloorPlanCanvas
          floorPlan={floorPlan}
          desks={desks}
          onDeskClick={handleDeskClick}
          onDeskMove={handleDeskMove}
          editable={true}
          showAssets={true}
          className="h-full"
        />
      </div>

      {/* Desk Editor Modal */}
      {isEditorOpen && (
        <DeskEditor
          floorPlan={floorPlan}
          desk={selectedDesk || undefined}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedDesk(null);
            setNewDeskPosition(undefined);
          }}
          onSave={handleSaveDesk}
          position={newDeskPosition}
        />
      )}
    </div>
  );
}
