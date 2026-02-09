import { recalculateAllDepreciation } from '../src/utils/updateDepreciation';
import dbConnect from '../src/lib/mongodb';

async function fixDepreciation() {
  try {
    console.log('🔄 Connecting to database...');
    await dbConnect();
    
    console.log('🔄 Recalculating depreciation for all assets...');
    const count = await recalculateAllDepreciation();
    
    console.log(`✅ Successfully updated ${count} assets`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDepreciation();
