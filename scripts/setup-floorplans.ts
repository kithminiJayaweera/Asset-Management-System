/**
 * Floor Plan Setup Script
 * 
 * This script creates sample floor plans and desks for demonstration purposes.
 * Run with: tsx scripts/setup-floorplans.ts
 */

import dbConnect from '../src/lib/mongodb';
import { Organization, Location, FloorPlan, Desk } from '../src/models';
import { Types } from 'mongoose';

async function setupFloorPlans() {
  try {
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    // Get first organization or create a demo one
    let organization = await Organization.findOne();
    
    if (!organization) {
      console.log('📝 Creating demo organization...');
      organization = await Organization.create({
        name: 'Demo Corporation',
        address: '123 Main Street, City, State 12345',
        phone: '+1-555-0100',
        email: 'info@democorp.com',
        website: 'https://democorp.com',
      });
      console.log('✅ Created demo organization:', organization.name);
    }

    const orgId = organization._id;

    // Create Building Location
    console.log('\n📍 Creating location hierarchy...');
    const building = await Location.create({
      name: 'Headquarters Building',
      type: 'building',
      organizationId: orgId,
      description: 'Main office building',
      isActive: true,
    });
    console.log('✅ Created building:', building.name);

    // Create Floor Locations
    const floor1 = await Location.create({
      name: 'Floor 1',
      type: 'floor',
      parentId: building._id,
      organizationId: orgId,
      description: 'First floor - Reception and common areas',
      isActive: true,
    });
    console.log('✅ Created floor:', floor1.name);

    const floor2 = await Location.create({
      name: 'Floor 2',
      type: 'floor',
      parentId: building._id,
      organizationId: orgId,
      description: 'Second floor - Engineering and IT',
      isActive: true,
    });
    console.log('✅ Created floor:', floor2.name);

    // Create sample floor plan for Floor 2
    console.log('\n🗺️  Creating floor plan...');
    const floorPlan = await FloorPlan.create({
      name: 'Floor 2 - Engineering Wing',
      locationId: floor2._id,
      organizationId: orgId,
      imageUrl: '/uploads/floorplans/sample-floor2.png',
      imageWidth: 1920,
      imageHeight: 1080,
      scale: 10, // 10 pixels per meter
      metadata: {
        fileType: 'image/png',
        fileSize: 0,
        originalFileName: 'sample-floor2.png',
      },
      isActive: true,
    });
    console.log('✅ Created floor plan:', floorPlan.name);

    // Create sample desks in a grid pattern
    console.log('\n🪑 Creating desks...');
    const desks = [];
    const rows = 4;
    const cols = 6;
    const deskWidth = 100;
    const deskHeight = 80;
    const startX = 200;
    const startY = 150;
    const spacingX = 150;
    const spacingY = 120;

    let deskCounter = 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const deskNumber = `E${row + 1}-${String(deskCounter).padStart(2, '0')}`;
        const x = startX + (col * spacingX);
        const y = startY + (row * spacingY);

        const desk = await Desk.create({
          deskNumber,
          name: `Engineering Desk ${deskCounter}`,
          locationId: floor2._id,
          floorPlanId: floorPlan._id,
          organizationId: orgId,
          coordinates: { x, y },
          width: deskWidth,
          height: deskHeight,
          rotation: 0,
          status: deskCounter % 3 === 0 ? 'occupied' : 
                  deskCounter % 5 === 0 ? 'maintenance' : 'available',
          deskType: deskCounter % 4 === 0 ? 'standing' : 'standard',
          capacity: 5,
          amenities: ['Monitor', 'Keyboard', 'Mouse'],
          isActive: true,
        });

        desks.push(desk);
        deskCounter++;
      }
    }

    console.log(`✅ Created ${desks.length} desks`);

    // Print summary
    console.log('\n📊 Setup Summary:');
    console.log('================');
    console.log(`Organization: ${organization.name}`);
    console.log(`Building: ${building.name}`);
    console.log(`Floors: ${floor1.name}, ${floor2.name}`);
    console.log(`Floor Plans: 1`);
    console.log(`Desks: ${desks.length}`);
    console.log(`  - Available: ${desks.filter(d => d.status === 'available').length}`);
    console.log(`  - Occupied: ${desks.filter(d => d.status === 'occupied').length}`);
    console.log(`  - Maintenance: ${desks.filter(d => d.status === 'maintenance').length}`);
    
    console.log('\n✅ Floor plan setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Upload a real floor plan image to /public/uploads/floorplans/');
    console.log('2. Update the floor plan imageUrl in the database');
    console.log('3. Navigate to /floorplans to view your floor plans');
    console.log('4. Navigate to /floorplans/' + floorPlan._id + '/edit to edit desks');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up floor plans:', error);
    process.exit(1);
  }
}

setupFloorPlans();
