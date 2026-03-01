import mongoose from 'mongoose';
import { TenantModel } from '../src/modules/tenants/tenant.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/outzidr-commerce';

async function listAllTenants() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    console.log('=== ALL TENANTS IN DATABASE ===\n');

    const allTenants = await TenantModel.find({}).lean();
    
    if (allTenants.length === 0) {
      console.log('No tenants found in database!');
    } else {
      allTenants.forEach((tenant, index) => {
        console.log(`${index + 1}. ${tenant.name}`);
        console.log(`   Slug: ${tenant.slug || 'MISSING'}`);
        console.log(`   TenantId: ${tenant.tenantId}`);
        console.log(`   Active: ${tenant.isActive}`);
        console.log(`   Created: ${tenant.createdAt}`);
        console.log('');
      });
    }

    console.log(`Total tenants: ${allTenants.length}\n`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to list tenants:', error);
    process.exit(1);
  }
}

listAllTenants();
