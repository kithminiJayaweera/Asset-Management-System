'use client';

import React, { useState, useEffect } from 'react';
import { IFloorPlan, IDesk, ApiResponse } from '@/types';
import { FloorPlanCanvas } from '@/components/floorplan/FloorPlanCanvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FloorPlanViewPageProps {
  params: {
    id: string;
  };
}

export default function FloorPlanViewPage({ params }: FloorPlanViewPageProps) {
  const router = useRouter();
  const [floorPlan, setFloorPlan] = useState<IFloorPlan | null>(null);
  const [desks, setDesks] = useState<IDesk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesk, setSelectedDesk] = useState<IDesk | null>(null);

  useEffect(() => {
    fetchFloorPlan();
  }, [params.id]);

  const fetchFloorPlan = async () => {
    try {
      const response = await fetch(`/api/floorplans/${params.id}`);
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

  const handleDeskClick = (desk: IDesk) => {
    setSelectedDesk(desk);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold">Loading floor plan...</div>
      </div>
    );
  }

  if (!floorPlan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Floor Plan Not Found</h2>
          <Button onClick={() => router.push('/floorplans')}>
            Back to Floor Plans
          </Button>
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
              onClick={() => router.push('/floorplans')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{floorPlan.name}</h1>
              <p className="text-sm text-gray-600">
                {desks.length} desk{desks.length !== 1 ? 's' : ''} •{' '}
                {desks.filter((d) => d.status === 'available').length} available
              </p>
            </div>
          </div>

          <Button onClick={() => router.push(`/floorplans/${params.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Floor Plan
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-6">
        <FloorPlanCanvas
          floorPlan={floorPlan}
          desks={desks}
          onDeskClick={handleDeskClick}
          editable={false}
          showAssets={true}
          className="h-full"
        />
      </div>

      {/* Desk Details Panel */}
      {selectedDesk && (
        <div className="fixed right-4 top-24 w-80 bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{selectedDesk.deskNumber}</h3>
              {selectedDesk.name && (
                <p className="text-sm text-gray-600">{selectedDesk.name}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedDesk(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Status Badge */}
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedDesk.status === 'available'
                    ? 'bg-green-100 text-green-800'
                    : selectedDesk.status === 'occupied'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedDesk.status === 'reserved'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {selectedDesk.status.charAt(0).toUpperCase() +
                  selectedDesk.status.slice(1)}
              </span>
            </div>

            {/* Details */}
            <div className="border-t pt-4 space-y-2">
              <div>
                <span className="font-semibold text-sm">Type:</span>
                <p className="text-sm">
                  {selectedDesk.deskType?.replace('-', ' ').replace(/\b\w/g, (c) =>
                    c.toUpperCase()
                  )}
                </p>
              </div>

              {selectedDesk.assignedTo && (
                <div>
                  <span className="font-semibold text-sm">Assigned To:</span>
                  <p className="text-sm">
                    {typeof selectedDesk.assignedTo === 'object'
                      ? (selectedDesk.assignedTo as any).name
                      : 'User'}
                  </p>
                </div>
              )}

              {selectedDesk.assignedAssets && selectedDesk.assignedAssets.length > 0 && (
                <div>
                  <span className="font-semibold text-sm">Assets:</span>
                  <p className="text-sm">
                    {selectedDesk.assignedAssets.length} /{' '}
                    {selectedDesk.capacity || 5}
                  </p>
                </div>
              )}

              {selectedDesk.amenities && selectedDesk.amenities.length > 0 && (
                <div>
                  <span className="font-semibold text-sm">Amenities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDesk.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDesk.notes && (
                <div>
                  <span className="font-semibold text-sm">Notes:</span>
                  <p className="text-sm text-gray-600">{selectedDesk.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
