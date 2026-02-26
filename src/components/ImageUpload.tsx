'use client';

import { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: number;
}

export function ImageUpload({ onUpload, maxFiles = 5, existingImages = 0 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string; type: string }[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    if (files.length + previews.length + existingImages > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: { file: File; url: string; type: string }[] = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} exceeds 5MB limit`);
        return;
      }

      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setError(`${file.name} is not a valid format (JPG, PNG, PDF only)`);
        return;
      }

      validFiles.push({
        file,
        url: URL.createObjectURL(file),
        type: file.type
      });
    });

    setPreviews(prev => [...prev, ...validFiles]);
    onUpload(validFiles.map(v => v.file));
  };

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  return (
    <div>
      <label className="block text-sm text-gray-700 mb-2">
        Upload Images/Documents ({existingImages + previews.length}/{maxFiles})
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={existingImages + previews.length >= maxFiles}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, PDF (max 5MB each)
          </p>
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                {preview.type === 'application/pdf' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FileText className="w-12 h-12 text-red-500" />
                  </div>
                ) : (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-600 mt-1 truncate">{preview.file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
