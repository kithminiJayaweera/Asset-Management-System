'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiResponse } from '@/types';

interface FloorPlanUploaderProps {
  organizationId: string;
  onUploadComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

export function FloorPlanUploader({
  organizationId,
  onUploadComplete,
  onError,
}: FloorPlanUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      if (onError) {
        onError('Invalid file type. Only PNG, JPEG, and PDF files are allowed.');
      }
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      if (onError) {
        onError('File size exceeds 10MB limit.');
      }
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organizationId);

      const response = await fetch('/api/upload/floorplan', {
        method: 'POST',
        body: formData,
      });

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
        // Reset form
        setFile(null);
        setPreview(null);
      } else {
        if (onError) {
          onError(result.error || 'Upload failed');
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (onError) {
        onError(error.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-semibold mb-2">
              Drag and drop your floor plan here
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse files
            </p>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="max-w-xs mx-auto"
            />
          </div>
          <div className="text-xs text-gray-500">
            Supported formats: PNG, JPEG, PDF (Max 10MB)
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <Label className="block mb-2 font-semibold">Preview</Label>
          <img
            src={preview}
            alt="Floor plan preview"
            className="max-w-full h-auto max-h-96 mx-auto border rounded"
          />
        </div>
      )}

      {/* File Info */}
      {file && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <Label className="block mb-2 font-semibold">File Information</Label>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Name:</span> {file.name}
            </p>
            <p>
              <span className="font-medium">Size:</span>{' '}
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p>
              <span className="font-medium">Type:</span> {file.type}
            </p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end gap-2">
        {file && (
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
          >
            Clear
          </Button>
        )}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Floor Plan'}
        </Button>
      </div>
    </div>
  );
}
