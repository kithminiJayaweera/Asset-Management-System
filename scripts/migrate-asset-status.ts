/**
 * Migration Script: Convert 'assigned' and 'available' status to 'active'
 * Run: npx ts-node scripts/migrate-asset-status.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const assetsCollection = db.collection('assets');

    // Find assets with old status values
    const assetsToMigrate = await assetsCollection.find({
      status: { $in: ['assigned', 'available'] }
    }).toArray();

    console.log(`Found ${assetsToMigrate.length} assets to migrate`);

    if (assetsToMigrate.length === 0) {
      console.log('✓ No assets to migrate');
      await mongoose.disconnect();
      return;
    }

    // Update all 'assigned' and 'available' to 'active'
    const result = await assetsCollection.updateMany(
      { status: { $in: ['assigned', 'available'] } },
      { $set: { status: 'active' } }
    );

    console.log(`✓ Migrated ${result.modifiedCount} assets`);
    console.log('  - Status "assigned" → "active"');
    console.log('  - Status "available" → "active"');
    console.log('  - Assignment state now derived from assignedTo field');

    // Remove duplicate asset tags (keep most recent)
    const duplicates = await assetsCollection.aggregate([
      { $group: { _id: '$assetTag', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length > 0) {
      console.log(`\nFound ${duplicates.length} duplicate asset tags`);
      
      for (const dup of duplicates) {
        const [keep, ...remove] = dup.ids;
        await assetsCollection.deleteMany({ _id: { $in: remove } });
        console.log(`  - Removed ${remove.length} duplicate(s) for tag: ${dup._id}`);
      }
    }

    // Create unique index
    try {
      await assetsCollection.createIndex(
        { assetTag: 1, organizationId: 1 },
        { unique: true }
      );
      console.log('✓ Created unique index on assetTag + organizationId');
    } catch (err: any) {
      if (err.code === 85) {
        console.log('⚠ Index already exists');
      } else {
        throw err;
      }
    }

    console.log('\n✓ Migration completed successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('✗ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrate();
