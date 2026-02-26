#!/bin/bash

echo "🚀 Setting up Asset Image Upload Feature..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with Cloudinary credentials:"
    echo ""
    echo "CLOUDINARY_CLOUD_NAME=your_cloud_name"
    echo "CLOUDINARY_API_KEY=your_api_key"
    echo "CLOUDINARY_API_SECRET=your_api_secret"
    echo ""
    exit 1
fi

# Check if Cloudinary credentials are set
if ! grep -q "CLOUDINARY_CLOUD_NAME" .env; then
    echo "⚠️  Warning: CLOUDINARY_CLOUD_NAME not found in .env"
fi

if ! grep -q "CLOUDINARY_API_KEY" .env; then
    echo "⚠️  Warning: CLOUDINARY_API_KEY not found in .env"
fi

if ! grep -q "CLOUDINARY_API_SECRET" .env; then
    echo "⚠️  Warning: CLOUDINARY_API_SECRET not found in .env"
fi

echo "📦 Installing dependencies..."
npm install cloudinary

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Ensure Cloudinary credentials are set in .env"
echo "2. Restart your development server: npm run dev"
echo "3. Test image upload in Asset Form"
echo ""
echo "📖 For detailed documentation, see IMAGE_UPLOAD_FEATURE.md"
