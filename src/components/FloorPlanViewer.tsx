'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MapPin, Upload } from 'lucide-react';

interface FloorPlan {
  _id: string;
  locationId: string;
  imageUrl: string;
  width: number;
  height: number;
}

interface Desk {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  occupied: boolean;
  assetId?: string;
}

export function FloorPlanViewer({ locationId }: { locationId: string }) {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFloorPlan();
  }, [locationId]);

  const fetchFloorPlan = async () => {
    try {
      const response = await fetch(`/api/floorplans?locationId=${locationId}`);
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setFloorPlan(result.data[0]);
      }
    } catch (error) {
      console.error('Error fetching floor plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading floor plan...</div>;
  }

  if (!floorPlan) {
    return (
      <div className="p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">No floor plan uploaded for this location</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto">
          <Upload className="w-4 h-4" />
          Upload Floor Plan
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h3 className="text-xl text-black mb-4">Floor Plan Viewer</h3>
      <div className="bg-white rounded-lg border p-4">
        <div className="relative" style={{ width: floorPlan.width, height: floorPlan.height }}>
          <img src={floorPlan.imageUrl} alt="Floor plan" className="w-full h-full" />
          {/* Canvas overlay for desks will be added with react-konva */}
          <div className="absolute top-4 right-4 bg-white p-2 rounded shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Occupied</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Note: Install react-konva for interactive desk placement: npm install react-konva konva
      </p>
    </div>
  );
}
