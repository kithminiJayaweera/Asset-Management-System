import mongoose from 'mongoose';
import Asset from '../src/models/Asset';
import Category from '../src/models/Category';

async function migrateCategories() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Get all unique categories per organization
    const assets = await Asset.find({}).select('category organizationId details').lean();
    const categoryMap = new Map<string, { orgId: string; fields: Set<string> }>();

    assets.forEach((asset: any) => {
      if (!asset.category) return;
      
      const key = `${asset.organizationId}_${asset.category}`;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { 
          orgId: asset.organizationId.toString(), 
          fields: new Set() 
        });
      }
      
      // Collect all field keys from details
      if (asset.details) {
        const detailsObj = asset.details instanceof Map ? Object.fromEntries(asset.details) : asset.details;
        Object.keys(detailsObj).forEach(fieldKey => {
          categoryMap.get(key)!.fields.add(fieldKey);
        });
      }
    });

    console.log(`📊 Found ${categoryMap.size} unique categories`);

    // Step 2: Create Category documents
    const categoryIdMap = new Map<string, string>();
    
    for (const [key, data] of categoryMap.entries()) {
      const [orgId, categoryName] = key.split('_');
      
      const fields = Array.from(data.fields).map(fieldKey => ({
        name: fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1'),
        key: fieldKey,
        type: 'text' as const,
        required: false,
      }));

      const category = await Category.findOneAndUpdate(
        { organizationId: orgId, name: categoryName },
        { 
          organizationId: orgId, 
          name: categoryName, 
          fields,
          isActive: true 
        },
        { upsert: true, new: true }
      );

      categoryIdMap.set(key, category._id.toString());
      console.log(`✅ Created/Updated category: ${categoryName} (${fields.length} fields)`);
    }

    // Step 3: Update assets with categoryId and migrate details to customFields
    let migratedCount = 0;
    const assetsCursor = Asset.find({}).cursor();

    for (let asset = await assetsCursor.next(); asset != null; asset = await assetsCursor.next()) {
      if (!asset.category) continue;

      const key = `${asset.organizationId}_${asset.category}`;
      const categoryId = categoryIdMap.get(key);

      if (categoryId) {
        // Migrate details to customFields
        const customFields: Record<string, any> = {};
        if (asset.details) {
          const detailsObj = asset.details instanceof Map ? Object.fromEntries(asset.details) : asset.details;
          Object.assign(customFields, detailsObj);
        }

        await Asset.updateOne(
          { _id: asset._id },
          { 
            $set: { 
              categoryId: new mongoose.Types.ObjectId(categoryId),
              customFields 
            } 
          }
        );

        migratedCount++;
        if (migratedCount % 100 === 0) {
          console.log(`📦 Migrated ${migratedCount} assets...`);
        }
      }
    }

    console.log(`\n✅ Migration complete! Migrated ${migratedCount} assets.`);
    console.log('⚠️  Old "category" and "details" fields are preserved for rollback safety.');
    console.log('💡 You can remove them in a future version after confirming everything works.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration
migrateCategories().catch(console.error);
