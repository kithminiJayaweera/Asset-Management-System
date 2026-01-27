/**
 * Database Setup Script
 * Run this once to initialize your asset_management database with proper collections
 * Usage: npx tsx scripts/setup-database.ts
 */

import mongoose from 'mongoose';

// Import all models to register them
import User from '../src/models/User';
import Asset from '../src/models/Asset';
import Organization from '../src/models/Organization';
import AssetRequest from '../src/models/AssetRequest';
import Maintenance from '../src/models/Maintenance';
import AuditLog from '../src/models/AuditLog';

const MONGODB_URI = 'mongodb+srv://kithmini:Astoria1234@cluster0.n8s7el8.mongodb.net/asset_management?retryWrites=true&w=majority&appName=Cluster0';

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Get all existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('\n📋 Current collections:', collectionNames);

    // Define required collections for your asset management system
    const requiredCollections = [
      'users',
      'assets', 
      'organizations',
      'assetrequests',
      'maintenances',
      'auditlogs'
    ];

    console.log('\n🔧 Setting up required collections...\n');

    // Create collections if they don't exist
    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${collectionName}`);
      }
    }

    // Create indexes for better performance
    console.log('\n🔍 Creating indexes...\n');
    
    try {
      await User.createIndexes();
      console.log('✅ User indexes created');
    } catch (e) {
      console.log('ℹ️  User indexes already exist');
    }
    
    try {
      await Asset.createIndexes();
      console.log('✅ Asset indexes created');
    } catch (e) {
      console.log('ℹ️  Asset indexes already exist');
    }
    
    try {
      await Organization.createIndexes();
      console.log('✅ Organization indexes created');
    } catch (e) {
      console.log('ℹ️  Organization indexes already exist');
    }

    console.log('\n✨ Database setup completed successfully!');
    console.log('\n📊 Your asset_management database now has:');
    requiredCollections.forEach(name => {
      console.log(`   - ${name}`);
    });

    console.log('\n⚠️  To remove sample databases (sample_mflix, etc.):');
    console.log('   1. Go to MongoDB Atlas (cloud.mongodb.com)');
    console.log('   2. Navigate to your cluster');
    console.log('   3. Click "Collections"');
    console.log('   4. For each sample database, click the trash icon to delete it');
    console.log('   5. Keep only: asset_management, admin, local, and config databases\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

setupDatabase();
