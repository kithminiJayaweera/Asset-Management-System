'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface FloorPlannerProps {
  locationId: string;
  onClose?: () => void;
}

export default function FloorPlanner({ locationId, onClose }: FloorPlannerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const res = await fetch(`/api/locations/${locationId}/layout`);
        const data = await res.json();
        console.log('Loaded layout:', data);
        if (data.layout && iframeRef.current?.contentWindow) {
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage(
              { type: 'LOAD_LAYOUT', data: data.layout },
              '*'
            );
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to load layout:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, [locationId]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'SAVE_LAYOUT') {
        console.log('=== SAVE LAYOUT START ===');
        console.log('Items to save:', event.data.data.length);
        console.log('Layout data:', JSON.stringify(event.data.data, null, 2));
        try {
          const res = await fetch(`/api/locations/${locationId}/layout`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ layout: event.data.data }),
          });
          const result = await res.json();
          console.log('Save response status:', res.status);
          console.log('Save result:', result);
          if (res.ok) {
            toast.success('Floor plan saved successfully');
          } else {
            toast.error('Failed to save floor plan');
          }
        } catch (error) {
          console.error('Save error:', error);
          toast.error('Failed to save floor plan');
        }
        console.log('=== SAVE LAYOUT END ===');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [locationId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="w-full h-full max-w-[98vw] max-h-[98vh] bg-[#0f1117] rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 bg-[#1a1d27] border-b border-[#2a2f45]">
          <h2 className="text-lg font-semibold text-white">Floor Plan Editor</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1e2130] hover:bg-[#2a2f45] text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f1117]/90 z-10">
            <div className="text-white">Loading floor planner...</div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/floor-planner.html"
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
