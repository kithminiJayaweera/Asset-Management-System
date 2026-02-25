'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText, Image as KonvaImage, Transformer } from 'react-konva';
import { toast } from 'sonner';
import { 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Upload, 
  Save, 
  Trash2, 
  MousePointer,
  Minus,
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export interface FloorPlanObject {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  text?: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  imageUrl?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

interface FloorPlanDesignerProps {
  floorId: string;
  floorName: string;
  initialData?: FloorPlanObject[];
  onSave?: (objects: FloorPlanObject[]) => void;
}

export function FloorPlanDesigner({ floorId, floorName, initialData = [], onSave }: FloorPlanDesignerProps) {
  const [objects, setObjects] = useState<FloorPlanObject[]>(initialData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'line' | 'text'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transformerRef = useRef<any>(null);

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const handleStageMouseDown = (e: any) => {
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    if (isDrawing) return;

    const pos = e.target.getStage().getPointerPosition();
    const newObject: FloorPlanObject = {
      id: `obj-${Date.now()}`,
      type: tool as any,
      x: pos.x,
      y: pos.y,
    };

    switch (tool) {
      case 'rect':
        newObject.width = 100;
        newObject.height = 60;
        newObject.fill = '#e0e7ff';
        newObject.stroke = '#6366f1';
        newObject.strokeWidth = 2;
        break;
      case 'circle':
        newObject.radius = 40;
        newObject.fill = '#dbeafe';
        newObject.stroke = '#3b82f6';
        newObject.strokeWidth = 2;
        break;
      case 'text':
        newObject.text = 'Double-click to edit';
        newObject.fontSize = 16;
        newObject.fill = '#000000';
        break;
      case 'line':
        setIsDrawing(true);
        newObject.points = [0, 0];
        newObject.stroke = '#374151';
        newObject.strokeWidth = 3;
        break;
    }

    setObjects([...objects, newObject]);
    setSelectedId(newObject.id);
  };

  const handleStageMouseMove = (e: any) => {
    if (!isDrawing || tool !== 'line') return;

    const pos = e.target.getStage().getPointerPosition();
    const lastObject = objects[objects.length - 1];
    
    if (lastObject && lastObject.type === 'line') {
      const newPoints = [0, 0, pos.x - lastObject.x, pos.y - lastObject.y];
      const updatedObjects = objects.slice(0, -1).concat({
        ...lastObject,
        points: newPoints,
      });
      setObjects(updatedObjects);
    }
  };

  const handleStageMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setTool('select');
    }
  };

  const handleObjectChange = (id: string, newAttrs: Partial<FloorPlanObject>) => {
    setObjects(objects.map(obj => obj.id === id ? { ...obj, ...newAttrs } : obj));
  };

  const handleDelete = () => {
    if (selectedId) {
      setObjects(objects.filter(obj => obj.id !== selectedId));
      setSelectedId(null);
      toast.success('Object deleted');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or SVG image');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('floorId', floorId);

      const response = await fetch('/api/floorplans/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const imageUrl = result.data.url;
        setUploadedImageUrl(imageUrl);
        
        // Load image for canvas background
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setBackgroundImage(img);
          toast.success('Floor plan image uploaded!');
        };
        img.onerror = () => {
          toast.error('Failed to load image');
        };
        img.src = imageUrl;
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    try {
      const floorPlanData = {
        floorId,
        objects,
        backgroundImageUrl: uploadedImageUrl,
      };

      const response = await fetch(`/api/locations/${floorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gridData: floorPlanData 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Floor plan saved!');
        onSave?.(objects);
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save floor plan');
    }
  };

  const handleExport = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${floorName}-floorplan.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Floor plan exported!');
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 mr-4">{floorName}</h3>
          
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded ${tool === 'select' ? 'bg-red-100 text-red-800' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Select"
          >
            <MousePointer className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded ${tool === 'rect' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Rectangle"
          >
            <Square className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded ${tool === 'circle' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Circle"
          >
            <CircleIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded ${tool === 'line' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Line/Wall"
          >
            <Minus className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded ${tool === 'text' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Text"
          >
            <Type className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
            title="Upload floor plan image"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm">Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
          />

          {selectedId && (
            <button
              onClick={handleDelete}
              className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-700"
              title="Delete selected"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 w-16 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white border rounded-lg p-4 overflow-auto">
        <div className="inline-block" style={{ backgroundColor: '#f9fafb' }}>
          <Stage
            ref={stageRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {/* Background Image */}
              {backgroundImage && (
                <KonvaImage
                  image={backgroundImage}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  listening={false}
                />
              )}

              {/* Grid */}
              {!backgroundImage && (
                <>
                  {Array.from({ length: Math.ceil(CANVAS_HEIGHT / 40) }).map((_, i) => (
                    <Line
                      key={`h-${i}`}
                      points={[0, i * 40, CANVAS_WIDTH, i * 40]}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                      listening={false}
                    />
                  ))}
                  {Array.from({ length: Math.ceil(CANVAS_WIDTH / 40) }).map((_, i) => (
                    <Line
                      key={`v-${i}`}
                      points={[i * 40, 0, i * 40, CANVAS_HEIGHT]}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                      listening={false}
                    />
                  ))}
                </>
              )}

              {/* Objects */}
              {objects.map((obj) => {
                if (obj.type === 'rect') {
                  return (
                    <Rect
                      key={obj.id}
                      id={obj.id}
                      x={obj.x}
                      y={obj.y}
                      width={obj.width}
                      height={obj.height}
                      fill={obj.fill}
                      stroke={obj.stroke}
                      strokeWidth={obj.strokeWidth}
                      draggable={tool === 'select'}
                      onClick={() => setSelectedId(obj.id)}
                      onDragEnd={(e) => {
                        handleObjectChange(obj.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        handleObjectChange(obj.id, {
                          x: node.x(),
                          y: node.y(),
                          width: node.width() * node.scaleX(),
                          height: node.height() * node.scaleY(),
                          rotation: node.rotation(),
                        });
                        node.scaleX(1);
                        node.scaleY(1);
                      }}
                    />
                  );
                }

                if (obj.type === 'circle') {
                  return (
                    <Circle
                      key={obj.id}
                      id={obj.id}
                      x={obj.x}
                      y={obj.y}
                      radius={obj.radius}
                      fill={obj.fill}
                      stroke={obj.stroke}
                      strokeWidth={obj.strokeWidth}
                      draggable={tool === 'select'}
                      onClick={() => setSelectedId(obj.id)}
                      onDragEnd={(e) => {
                        handleObjectChange(obj.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        handleObjectChange(obj.id, {
                          x: node.x(),
                          y: node.y(),
                          radius: (obj.radius || 40) * scaleX,
                        });
                        node.scaleX(1);
                        node.scaleY(1);
                      }}
                    />
                  );
                }

                if (obj.type === 'line') {
                  return (
                    <Line
                      key={obj.id}
                      id={obj.id}
                      x={obj.x}
                      y={obj.y}
                      points={obj.points}
                      stroke={obj.stroke}
                      strokeWidth={obj.strokeWidth}
                      draggable={tool === 'select'}
                      onClick={() => setSelectedId(obj.id)}
                      onDragEnd={(e) => {
                        handleObjectChange(obj.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                    />
                  );
                }

                if (obj.type === 'text') {
                  return (
                    <KonvaText
                      key={obj.id}
                      id={obj.id}
                      x={obj.x}
                      y={obj.y}
                      text={obj.text}
                      fontSize={obj.fontSize}
                      fill={obj.fill}
                      draggable={tool === 'select'}
                      onClick={() => setSelectedId(obj.id)}
                      onDblClick={(e) => {
                        const textNode = e.target;
                        textNode.hide();
                        
                        const textPosition = textNode.getAbsolutePosition();
                        
                        const input = document.createElement('input');
                        input.value = obj.text || '';
                        input.style.position = 'absolute';
                        input.style.top = `${textPosition.y}px`;
                        input.style.left = `${textPosition.x}px`;
                        input.style.fontSize = `${obj.fontSize}px`;
                        input.style.border = '1px solid #6366f1';
                        input.style.padding = '4px';
                        document.body.appendChild(input);
                        input.focus();
                        
                        const saveText = () => {
                          handleObjectChange(obj.id, { text: input.value });
                          document.body.removeChild(input);
                          textNode.show();
                        };
                        
                        input.addEventListener('blur', saveText);
                        input.addEventListener('keydown', (e) => {
                          if (e.key === 'Enter') saveText();
                        });
                      }}
                      onDragEnd={(e) => {
                        handleObjectChange(obj.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                      }}
                    />
                  );
                }

                return null;
              })}

              {/* Transformer for selected object */}
              {tool === 'select' && (
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        <p className="font-semibold mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Upload a floor plan image as background, or draw from scratch on the grid</li>
          <li>Use Rectangle/Circle for rooms, desks, or furniture</li>
          <li>Use Line tool to draw walls or boundaries</li>
          <li>Double-click text to edit labels</li>
          <li>Select objects to move, resize, or rotate them</li>
          <li>Don&apos;t forget to click Save after making changes!</li>
        </ul>
      </div>
    </div>
  );
}
