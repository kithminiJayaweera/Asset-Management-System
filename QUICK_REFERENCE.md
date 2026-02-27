# Image Upload Feature - Quick Reference

## 🚀 Setup (5 minutes)

```bash
# 1. Install package
npm install cloudinary

# 2. Add to .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# 3. Restart server
npm run dev
```

## 📦 Components

### ImageUpload
```tsx
import { ImageUpload } from '@/components/ImageUpload';

<ImageUpload
  onUpload={(files) => setUploadedFiles(files)}
  maxFiles={5}
  existingImages={0}
/>
```

### ImageGallery
```tsx
import { ImageGallery } from '@/components/ImageGallery';

<ImageGallery
  images={asset.images}
  assetId={asset._id}
  onDelete={(publicId) => handleDelete(publicId)}
  onSetPrimary={(publicId) => handleSetPrimary(publicId)}
/>
```

## 🔌 API Usage

### Upload Image
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('assetId', assetId);
formData.append('isPrimary', 'false');

const response = await fetch('/api/assets/images', {
  method: 'POST',
  body: formData,
});
```

### Delete Image
```typescript
await fetch(`/api/assets/images?assetId=${assetId}&publicId=${publicId}`, {
  method: 'DELETE',
});
```

## 📋 Validation Rules

- **Max file size:** 5MB
- **Max files:** 5 per asset
- **Allowed types:** JPG, PNG, PDF
- **Required fields:** file

## 🗄️ Database Schema

```typescript
images: [{
  url: String,
  publicId: String,
  fileName: String,
  fileType: String,
  fileSize: Number,
  isPrimary: Boolean,
  uploadedAt: Date
}]
```

## 🎯 Common Tasks

### Add Upload to Form
1. Import ImageUpload component
2. Add state: `const [files, setFiles] = useState<File[]>([])`
3. Add component: `<ImageUpload onUpload={setFiles} />`
4. Include files in form submission

### Display Images
1. Import ImageGallery component
2. Add handlers for delete and set primary
3. Add component: `<ImageGallery images={asset.images} ... />`

### Handle Upload in API
```typescript
const formData = await req.formData();
const file = formData.get('file') as File;
const result = await uploadToCloudinary(file, 'assets');
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload fails | Check Cloudinary credentials in .env |
| Images not showing | Verify Cloudinary URLs are accessible |
| File too large | Reduce file size or increase limit |
| Wrong file type | Check ALLOWED_TYPES in API route |

## 📚 Documentation

- **Full docs:** IMAGE_UPLOAD_FEATURE.md
- **Summary:** IMPLEMENTATION_SUMMARY.md
- **Main README:** README.md

## 💡 Tips

- Always validate files client-side before upload
- Use isPrimary flag for asset thumbnails
- Store publicId for deletion
- Handle errors gracefully
- Show loading states during upload
- Compress large images before upload
- Use Cloudinary transformations for optimization

## 🔗 Useful Links

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#formdata)
- [MongoDB Arrays](https://www.mongodb.com/docs/manual/core/document/#arrays)
