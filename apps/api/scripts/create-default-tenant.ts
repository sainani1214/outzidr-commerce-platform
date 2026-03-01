import mongoose from 'mongoose';
import { TenantModel } from '../src/modules/tenants/tenant.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/outzidr-commerce';

async function createDefaultTenant() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await TenantModel.findOne({ slug: 'default' });
    
    if (existing) {
      console.log('Default tenant already exists');
      console.log(existing.toTenantObject());
    } else {
      const defaultTenant = new TenantModel({
        tenantId: 'tenant_default',
        slug: 'default',
        name: 'Default Organization',
        metadata: {
          type: 'default',
          description: 'Default tenant for regular users',
        },
        isActive: true,
      });
      
      await defaultTenant.save();
      console.log('Created default tenant:');
      console.log(defaultTenant.toTenantObject());
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to create default tenant:', error);
    process.exit(1);
  }
}

createDefaultTenant();
