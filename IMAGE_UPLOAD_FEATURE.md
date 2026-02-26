# Asset Image Upload Feature - Implementation Guide

## Overview
This feature enables uploading and managing multiple images and documents (JPG, PNG, PDF) for each asset, with support for setting a primary image, viewing in a gallery, and cloud storage via Cloudinary.

## Features Implemented

### 1. Multiple File Upload
- Upload up to 5 files per asset
- Supported formats: JPG, PNG, PDF
- Maximum file size: 5MB per file
- Real-time file validation
- Preview before upload

### 2. Image Gallery
- Grid view of all uploaded images/documents
- Click to view full-size
- PDF preview with download option
- Set primary image (marked with star badge)
- Delete individual images

### 3. Cloud Storage
- Integrated with Cloudinary
- Automatic image optimization
- Secure file storage
- Public URL generation

## Files Created/Modified

### New Files Created:
1. `src/lib/cloudinary.ts` - Cloudinary integration utility
2. `src/components/ImageUpload.tsx` - File upload component with preview
3. `src/components/ImageGallery.tsx` - Image gallery display component
4. `src/app/api/assets/images/route.ts` - API endpoints for image upload/delete

### Modified Files:
1. `src/models/Asset.ts` - Added images array field
2. `src/types/index.ts` - Added IAssetImage interface
3. `src/components/AssetForm.tsx` - Integrated ImageUpload component
4. `src/components/AssetDetail.tsx` - Integrated ImageGallery component
5. `package.json` - Added cloudinary dependency

## Database Schema Changes

### Asset Model - New Fields:
```typescript
images: [{
  url: String,           // Cloudinary URL
  publicId: String,      // Cloudinary public ID for deletion
  fileName: String,      // Original file name
  fileType: String,      // MIME type
  fileSize: Number,      // Size in bytes
  isPrimary: Boolean,    // Primary image flag
  uploadedAt: Date       // Upload timestamp
}]
```

## API Endpoints

### POST /api/assets/images
Upload a new image/document for an asset.

**Request (FormData):**
- `file`: File object
- `assetId`: Asset ID (optional, for existing assets)
- `isPrimary`: Boolean (set as primary image)

**Response:**
```json
{
  "success": true,
  "image": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "asset-management/assets/...",
    "fileName": "invoice.pdf",
    "fileType": "application/pdf",
    "fileSize": 245678,
    "isPrimary": false,
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### DELETE /api/assets/images
Delete an image from an asset.

**Query Parameters:**
- `assetId`: Asset ID
- `publicId`: Cloudinary public ID

**Response:**
```json
{
  "success": true
}
```

## Usage Examples

### 1. In Asset Form (Create/Edit)
```tsx
import { ImageUpload } from '@/components/ImageUpload';

<ImageUpload
  onUpload={setUploadedFiles}
  maxFiles={5}
  existingImages={asset?.images?.length || 0}
/>
```

### 2. In Asset Detail View
```tsx
import { ImageGallery } from '@/components/ImageGallery';

<ImageGallery
  images={asset.images}
  assetId={asset._id}
  onDelete={handleDeleteImage}
  onSetPrimary={handleSetPrimaryImage}
/>
```

## Environment Variables Required

Ensure these are set in `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation Steps

1. **Install Cloudinary package:**
```bash
npm install cloudinary
```

2. **Configure environment variables** in `.env` file

3. **Run database migration** (if needed):
```bash
npm run db:migrate
```

4. **Restart development server:**
```bash
npm run dev
```

## File Upload Flow

1. User selects files in AssetForm
2. Files are validated (size, type)
3. Preview is shown to user
4. On form submit, files are uploaded to Cloudinary
5. Cloudinary returns secure URLs
6. URLs and metadata are saved to Asset document
7. Images appear in AssetDetail gallery

## Security Considerations

- File size validation (5MB limit)
- File type validation (JPG, PNG, PDF only)
- Cloudinary signed uploads (server-side)
- Public ID obfuscation
- Automatic malware scanning (Cloudinary feature)

## Performance Optimizations

- Cloudinary automatic image optimization
- Lazy loading in gallery
- Thumbnail generation
- CDN delivery
- Client-side file validation before upload

## Use Cases

### 1. Product Photos
- Upload product images during asset creation
- Set primary image for asset thumbnail
- View all product angles in gallery

### 2. Purchase Invoices
- Upload PDF invoices as proof of purchase
- Store multiple invoices for warranty claims
- Download invoices when needed

### 3. Warranty Certificates
- Upload warranty documents
- Track warranty expiry with documents
- Easy access for claims

### 4. Maintenance Receipts
- Upload maintenance service receipts
- Track maintenance history with documents
- Audit trail for asset lifecycle

## Future Enhancements

- [ ] Bulk image upload
- [ ] Image compression before upload
- [ ] Image cropping/editing
- [ ] OCR for invoice data extraction
- [ ] Image tagging and categorization
- [ ] Download all images as ZIP
- [ ] Image search functionality
- [ ] Version history for documents

## Troubleshooting

### Issue: Upload fails with 413 error
**Solution:** Check Next.js body size limit in `next.config.ts`:
```typescript
export default {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
```

### Issue: Images not displaying
**Solution:** Verify Cloudinary credentials and check browser console for CORS errors.

### Issue: Slow upload
**Solution:** Implement client-side image compression before upload.

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images (up to 5)
- [ ] Upload PDF document
- [ ] Set primary image
- [ ] Delete image
- [ ] View full-size image
- [ ] Download PDF
- [ ] File size validation
- [ ] File type validation
- [ ] Error handling

## Support

For issues or questions, contact the development team or create an issue in the repository.
