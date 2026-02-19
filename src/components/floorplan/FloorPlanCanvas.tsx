'use client';

import React, { useRef, useEffect, useState } from 'react';
import { IDesk, IFloorPlan, IFloorPlanItem } from '@/types';

interface FloorPlanCanvasProps {
  floorPlan: IFloorPlan;
  desks: IDesk[];
  onDeskClick?: (desk: IDesk) => void;
  onDeskMove?: (deskId: string, newPosition: { x: number; y: number }) => void;
  editable?: boolean;
  showAssets?: boolean;
  className?: string;
}

export function FloorPlanCanvas({
  floorPlan,
  desks,
  onDeskClick,
  onDeskMove,
  editable = false,
  showAssets = true,
  className = '',
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null);
  const [draggingDesk, setDraggingDesk] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Status color mapping
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available':
        return 'bg-green-500 border-green-600';
      case 'occupied':
        return 'bg-blue-500 border-blue-600';
      case 'reserved':
        return 'bg-yellow-500 border-yellow-600';
      case 'maintenance':
        return 'bg-orange-500 border-orange-600';
      case 'unavailable':
        return 'bg-gray-400 border-gray-500';
      default:
        return 'bg-gray-300 border-gray-400';
    }
  };

  const handleDeskMouseDown = (desk: IDesk, event: React.MouseEvent) => {
    if (!editable) {
      if (onDeskClick) {
        onDeskClick(desk);
      }
      return;
    }

    event.stopPropagation();
    setDraggingDesk(desk._id as string);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left - desk.coordinates.x * scale - pan.x,
        y: event.clientY - rect.top - desk.coordinates.y * scale - pan.y,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggingDesk || !editable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = (event.clientX - rect.left - pan.x - dragOffset.x) / scale;
    const newY = (event.clientY - rect.top - pan.y - dragOffset.y) / scale;

    // Update desk position temporarily
    const deskElements = canvasRef.current.querySelectorAll(`[data-desk-id="${draggingDesk}"]`);
    deskElements.forEach((el) => {
      (el as HTMLElement).style.left = `${newX}px`;
      (el as HTMLElement).style.top = `${newY}px`;
    });
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!draggingDesk || !editable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, (event.clientX - rect.left - pan.x - dragOffset.x) / scale);
    const newY = Math.max(0, (event.clientY - rect.top - pan.y - dragOffset.y) / scale);

    if (onDeskMove) {
      onDeskMove(draggingDesk, { x: newX, y: newY });
    }

    setDraggingDesk(null);
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.1, Math.min(3, prev + delta)));
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  return (
    <div className={`relative overflow-hidden border rounded-lg bg-gray-100 ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex gap-2 bg-white p-2 rounded shadow-md">
        <button
          onClick={() => handleZoom(0.1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zoom In
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zoom Out
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
        <span className="px-3 py-1 bg-gray-100 rounded">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 z-10 bg-white p-3 rounded shadow-md">
        <h3 className="font-bold text-sm mb-2">Status Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border border-green-600 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 border border-yellow-600 rounded"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 border border-orange-600 rounded"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-move"
        style={{ minHeight: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Floor plan image */}
        <img
          src={floorPlan.imageUrl}
          alt={floorPlan.name}
          className="absolute pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'top left',
            width: `${floorPlan.imageWidth}px`,
            height: `${floorPlan.imageHeight}px`,
          }}
        />

        {/* Desks */}
        {desks.map((desk) => (
          <div
            key={desk._id as string}
            data-desk-id={desk._id as string}
            className={`absolute ${getStatusColor(desk.status)} border-2 rounded-md cursor-pointer transition-all hover:shadow-lg ${
              selectedDesk === desk._id ? 'ring-4 ring-purple-500' : ''
            } ${draggingDesk === desk._id ? 'opacity-70' : ''}`}
            style={{
              left: `${desk.coordinates.x * scale + pan.x}px`,
              top: `${desk.coordinates.y * scale + pan.y}px`,
              width: `${(desk.width || 100) * scale}px`,
              height: `${(desk.height || 80) * scale}px`,
              transform: `rotate(${desk.rotation || 0}deg)`,
            }}
            onMouseDown={(e) => handleDeskMouseDown(desk, e)}
            onClick={() => {
              setSelectedDesk(desk._id as string);
              if (onDeskClick && !editable) {
                onDeskClick(desk);
              }
            }}
          >
            <div className="flex items-center justify-center h-full text-white text-xs font-bold">
              {desk.deskNumber}
            </div>

            {/* Asset count badge */}
            {showAssets && desk.assignedAssets && desk.assignedAssets.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {desk.assignedAssets.length}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Panel */}
      {selectedDesk && (
        <div className="absolute bottom-2 left-2 right-2 bg-white p-4 rounded-lg shadow-lg">
          {(() => {
            const desk = desks.find((d) => d._id === selectedDesk);
            if (!desk) return null;

            return (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{desk.deskNumber}</h3>
                    {desk.name && <p className="text-sm text-gray-600">{desk.name}</p>}
                  </div>
                  <button
                    onClick={() => setSelectedDesk(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Status:</span> {desk.status}
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span> {desk.deskType}
                  </div>
                  {desk.assignedAssets && (
                    <div className="col-span-2">
                      <span className="font-semibold">Assets:</span> {desk.assignedAssets.length}
                    </div>
                  )}
                  {desk.notes && (
                    <div className="col-span-2">
                      <span className="font-semibold">Notes:</span> {desk.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
