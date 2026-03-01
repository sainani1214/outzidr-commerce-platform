import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/outzidr-commerce';

interface PricingRule {
  tenantId: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  conditions: {
    minQuantity?: number;
    maxQuantity?: number;
    minInventory?: number;
    maxInventory?: number;
    validFrom?: Date;
    validUntil?: Date;
  };
  priority: number;
  isActive: boolean;
  productId?: string;
}

async function seedPricingRules() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db!;
    const rulesCollection = db.collection('pricingrules');
    const tenantsCollection = db.collection('tenants');

    // Get all tenants
    const tenants = await tenantsCollection.find({}).toArray();
    console.log(`Found ${tenants.length} tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n💰 Creating pricing rules for: ${tenant.name} (${tenant.slug})`);
      
      // Delete existing rules for this tenant
      const deleteResult = await rulesCollection.deleteMany({ tenantId: tenant.tenantId });
      console.log(`  🗑️  Deleted ${deleteResult.deletedCount} existing rules`);

      const rules: PricingRule[] = [];

      // Common rules for all tenants
      
      // 1. Bulk Purchase Discount (5+ items)
      rules.push({
        tenantId: tenant.tenantId,
        name: 'Bulk Purchase Discount',
        description: 'Get 10% off when buying 5 or more items',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        conditions: {
          minQuantity: 5,
        },
        priority: 10,
        isActive: true,
      });

      // 2. Large Order Discount (10+ items)
      rules.push({
        tenantId: tenant.tenantId,
        name: 'Large Order Discount',
        description: 'Get 15% off when buying 10 or more items',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        conditions: {
          minQuantity: 10,
        },
        priority: 20,
        isActive: true,
      });

      // 3. Low Inventory Clearance
      rules.push({
        tenantId: tenant.tenantId,
        name: 'Clearance Sale',
        description: 'Get 20% off on low stock items (less than 20 in stock)',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        conditions: {
          maxInventory: 20,
        },
        priority: 30,
        isActive: true,
      });

      // 4. New Customer Welcome (Fixed discount)
      rules.push({
        tenantId: tenant.tenantId,
        name: 'Welcome Discount',
        description: '$5 off on your first purchase',
        discountType: 'FIXED_AMOUNT',
        discountValue: 5,
        conditions: {},
        priority: 5,
        isActive: true,
      });

      // 5. Weekend Special (if you want to add date-based)
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7));
      nextSaturday.setHours(0, 0, 0, 0);
      
      const nextSunday = new Date(nextSaturday);
      nextSunday.setDate(nextSunday.getDate() + 1);
      nextSunday.setHours(23, 59, 59, 999);

      rules.push({
        tenantId: tenant.tenantId,
        name: 'Weekend Special',
        description: 'Get 12% off on weekend purchases',
        discountType: 'PERCENTAGE',
        discountValue: 12,
        conditions: {
          validFrom: nextSaturday,
          validUntil: nextSunday,
        },
        priority: 15,
        isActive: true,
      });

      // Tenant-specific rules
      if (tenant.slug === 'electronics') {
        // Electronics bundle discount
        rules.push({
          tenantId: tenant.tenantId,
          name: 'Tech Bundle Deal',
          description: 'Buy 3+ electronics items and get 18% off',
          discountType: 'PERCENTAGE',
          discountValue: 18,
          conditions: {
            minQuantity: 3,
          },
          priority: 25,
          isActive: true,
        });
      } else if (tenant.slug === 'outzidr') {
        // Outdoor gear seasonal discount
        rules.push({
          tenantId: tenant.tenantId,
          name: 'Outdoor Adventure Bundle',
          description: 'Buy 3+ outdoor items and get 15% off',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          conditions: {
            minQuantity: 3,
          },
          priority: 25,
          isActive: true,
        });
      } else if (tenant.slug === 'reliance') {
        // Grocery bulk discount
        rules.push({
          tenantId: tenant.tenantId,
          name: 'Grocery Saver',
          description: 'Buy 8+ grocery items and get 12% off',
          discountType: 'PERCENTAGE',
          discountValue: 12,
          conditions: {
            minQuantity: 8,
          },
          priority: 25,
          isActive: true,
        });
      }

      // Add timestamps
      const rulesWithTimestamps = rules.map(rule => ({
        ...rule,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Insert rules
      if (rulesWithTimestamps.length > 0) {
        const insertResult = await rulesCollection.insertMany(rulesWithTimestamps);
        console.log(`  ✅ Added ${insertResult.insertedCount} pricing rules`);
        
        // Show sample rules
        console.log(`  📋 Sample rules:`);
        rules.slice(0, 3).forEach((r, i) => {
          console.log(`     ${i + 1}. ${r.name} - ${r.discountValue}${r.discountType === 'PERCENTAGE' ? '%' : '$'} off`);
        });
      }
    }

    console.log('\n\n🎉 Pricing rules seeding complete!\n');
    console.log('Summary:');
    console.log('  - Bulk Purchase Discount (5+ items): 10% off');
    console.log('  - Large Order Discount (10+ items): 15% off');
    console.log('  - Clearance Sale (low stock): 20% off');
    console.log('  - Welcome Discount: $5 off');
    console.log('  - Weekend Special: 12% off');
    console.log('  - Tenant-specific bundle deals\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding pricing rules:', error);
    process.exit(1);
  }
}

seedPricingRules();
