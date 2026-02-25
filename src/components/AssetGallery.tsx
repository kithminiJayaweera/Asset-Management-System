import { useState, useEffect } from 'react';
import { X, Star, Trash2, FileText, Image as ImageIcon } from 'lucide-react';

interface AssetImage {
  _id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isPrimary: boolean;
  uploadedAt: string;
}

interface AssetGalleryProps {
  assetId: string;
  onClose?: () => void;
}

export function AssetGallery({ assetId, onClose }: AssetGalleryProps) {
  const [images, setImages] = useState<AssetImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<AssetImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, [assetId]);

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/assets/${assetId}/images`);
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const res = await fetch(`/api/assets/${assetId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setImages(images.filter(img => img._id !== imageId));
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const isPDF = (fileType: string) => fileType === 'application/pdf';

  if (loading) {
    return <div className="p-8 text-center">Loading images...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Asset Gallery</h2>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image._id}
              className="relative group border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedImage(image)}
            >
              {isPDF(image.fileType) ? (
                <div className="aspect-square bg-red-50 flex items-center justify-center">
                  <FileText className="w-16 h-16 text-red-500" />
                </div>
              ) : (
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full aspect-square object-cover"
                />
              )}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Primary
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(image._id);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedImage.fileName}</h3>
                <p className="text-sm text-gray-500">{formatFileSize(selectedImage.fileSize)}</p>
              </div>
              <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              {isPDF(selectedImage.fileType) ? (
                <iframe src={selectedImage.url} className="w-full h-[70vh]" />
              ) : (
                <img src={selectedImage.url} alt={selectedImage.fileName} className="w-full h-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
