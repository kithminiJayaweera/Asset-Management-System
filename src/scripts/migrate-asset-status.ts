import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';

/**
 * Migration: Fix Asset Status Values
 * Converts 'assigned' and 'available' to 'active'
 * Run: npx tsx src/scripts/migrate-asset-status.ts
 */
async function migrateAssetStatus() {
  try {
    await dbConnect();
    
    const Asset = mongoose.connection.collection('assets');
    
    // Convert 'assigned' and 'available' to 'active'
    const result = await Asset.updateMany(
      { status: { $in: ['assigned', 'available'] } },
      { $set: { status: 'active' } }
    );
    
    console.log(`✅ Migration complete: ${result.modifiedCount} assets updated`);
    
    // Show current status distribution
    const statusCounts = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('\n📊 Current status distribution:');
    statusCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateAssetStatus();
