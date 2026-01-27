/**
 * Seed Organizations Script
 * Run this to add initial organizations to the database
 * Usage: npx tsx scripts/seed-organizations.ts
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kithmini:Astoria1234@cluster0.n8s7el8.mongodb.net/asset_management?retryWrites=true&w=majority&appName=Cluster0';

const organizations = [
  {
    name: 'Botcalm',
    address: '123 Tech Street, Colombo 03, Sri Lanka',
    phone: '+94 11 234 5678',
    email: 'info@botcalm.lk',
    website: 'https://botcalm.lk',
  },
  {
    name: 'Certix',
    address: '456 Business Avenue, Colombo 07, Sri Lanka',
    phone: '+94 11 345 6789',
    email: 'contact@certix.lk',
    website: 'https://certix.lk',
  },
  {
    name: 'Calm',
    address: '789 Innovation Road, Colombo 05, Sri Lanka',
    phone: '+94 11 456 7890',
    email: 'hello@calm.lk',
    website: 'https://calm.lk',
  },
];

async function seedOrganizations() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const organizationsCollection = db.collection('organizations');

    console.log('📦 Adding organizations...\n');

    for (const org of organizations) {
      // Check if organization already exists
      const existing = await organizationsCollection.findOne({ name: org.name });
      
      if (existing) {
        console.log(`ℹ️  Organization "${org.name}" already exists. Skipping...`);
      } else {
        await organizationsCollection.insertOne({
          ...org,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Added organization: ${org.name}`);
      }
    }

    console.log('\n✨ Organization seeding completed!');
    console.log('\n📋 Organizations in database:');
    
    const allOrgs = await organizationsCollection.find({}).toArray();
    allOrgs.forEach((org: any) => {
      console.log(`   - ${org.name} (${org.email})`);
    });

    console.log(`\n📊 Total organizations: ${allOrgs.length}\n`);

  } catch (error) {
    console.error('❌ Error seeding organizations:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

seedOrganizations();
