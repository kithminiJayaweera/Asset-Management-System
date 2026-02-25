# Asset Image Upload Feature - Installation Guide

## 1. Install Cloudinary Package

Run the following command to install the required dependency:

```bash
npm install cloudinary
```

## 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 3. Get Cloudinary Credentials

1. Sign up for a free account at https://cloudinary.com
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Paste them into your `.env.local` file

## 4. Files Created

- `/src/lib/cloudinary.ts` - Cloudinary configuration and upload/delete functions
- `/src/models/AssetImage.ts` - MongoDB schema for asset images
- `/src/app/api/assets/[id]/upload/route.ts` - Upload API endpoint
- `/src/app/api/assets/[id]/images/route.ts` - Fetch and delete images API endpoint
- `/src/components/AssetGallery.tsx` - Image gallery component
- Updated `/src/components/AssetForm.tsx` - Added image upload section

## 5. Usage

### Upload Images (Edit Mode Only)
1. Edit an existing asset
2. Scroll to "Asset Images" section
3. Click "Choose File" and select an image (JPG, PNG, or PDF)
4. Image will be uploaded automatically

### View Images
Import and use the AssetGallery component:

```tsx
import { AssetGallery } from '@/components/AssetGallery';

<AssetGallery assetId={asset.id} />
```

## 6. Features Implemented

✅ Upload multiple images per asset
✅ Image preview in asset form
✅ Image gallery component
✅ Support for JPG, PNG, PDF formats
✅ File size validation (max 5MB)
✅ Cloud storage integration (Cloudinary)
✅ Delete uploaded images
✅ Set primary image for asset

## 7. API Endpoints

- `POST /api/assets/[id]/upload` - Upload image
- `GET /api/assets/[id]/images` - Get all images for an asset
- `DELETE /api/assets/[id]/images?imageId=[imageId]` - Delete an image

## 8. Next Steps

After installing the cloudinary package and setting up environment variables:

```bash
npm install cloudinary
```

Then restart your development server:

```bash
npm run dev
```
