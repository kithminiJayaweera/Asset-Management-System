'use client';

import { useState } from 'react';
import { X, Star, Trash2, FileText, Download } from 'lucide-react';
import { IAssetImage } from '@/types';

interface ImageGalleryProps {
  images: IAssetImage[];
  assetId: string;
  onDelete: (publicId: string) => void;
  onSetPrimary: (publicId: string) => void;
}

export function ImageGallery({ images, assetId, onDelete, onSetPrimary }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<IAssetImage | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No images uploaded yet</p>
      </div>
    );
  }

  const isPDF = (fileType: string) => fileType === 'application/pdf';

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.publicId} className="relative group">
            <div
              className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => setSelectedImage(image)}
            >
              {isPDF(image.fileType) ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                  <FileText className="w-12 h-12 text-red-500" />
                  <p className="text-xs text-gray-600 mt-2">PDF</p>
                </div>
              ) : (
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                />
              )}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}
            </div>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {!image.isPrimary && (
                <button
                  onClick={() => onSetPrimary(image.publicId)}
                  className="bg-white p-1.5 rounded-full shadow-lg hover:bg-yellow-50"
                  title="Set as primary"
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                </button>
              )}
              <button
                onClick={() => onDelete(image.publicId)}
                className="bg-white p-1.5 rounded-full shadow-lg hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
            
            <p className="text-xs text-gray-600 mt-1 truncate">{image.fileName}</p>
            <p className="text-xs text-gray-400">{(image.fileSize / 1024).toFixed(1)} KB</p>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-4">
              {isPDF(selectedImage.fileType) ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-24 h-24 text-red-500 mb-4" />
                  <p className="text-lg font-medium mb-2">{selectedImage.fileName}</p>
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Download className="w-4 h-4" />
                    Open PDF
                  </a>
                </div>
              ) : (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.fileName}
                  className="max-w-full max-h-[80vh] object-contain mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
