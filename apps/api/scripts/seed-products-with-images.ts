import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/outzidr-commerce';

// Product data for electronics tenant
const electronicsProducts = [
  {
    sku: 'ELEC-001',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life with quick charging.',
    price: 399.99,
    inventory: 50,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony'],
    isActive: true,
  },
  {
    sku: 'ELEC-002',
    name: 'Apple iPad Pro 12.9" M2',
    description: '12.9-inch Liquid Retina XDR display. M2 chip for incredible performance. Works with Apple Pencil and Magic Keyboard.',
    price: 1099.00,
    inventory: 30,
    category: 'Tablets',
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=500&fit=crop',
    tags: ['ipad', 'tablet', 'apple', 'm2'],
    isActive: true,
  },
  {
    sku: 'ELEC-003',
    name: 'Samsung 55" QLED 4K Smart TV',
    description: 'Quantum Dot technology delivers brilliant color and contrast. Smart TV powered by Tizen OS with built-in voice assistants.',
    price: 899.99,
    inventory: 25,
    category: 'TVs',
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=500&fit=crop',
    tags: ['tv', 'smart-tv', 'qled', '4k', 'samsung'],
    isActive: true,
  },
  {
    sku: 'ELEC-004',
    name: 'Canon EOS R6 Mirrorless Camera',
    description: 'Full-frame 20MP sensor with 4K 60fps video. In-body image stabilization and advanced autofocus system.',
    price: 2499.00,
    inventory: 15,
    category: 'Cameras',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop',
    tags: ['camera', 'mirrorless', 'canon', 'photography'],
    isActive: true,
  },
  {
    sku: 'ELEC-005',
    name: 'Dell XPS 15 Laptop',
    description: '15.6" 4K OLED display, Intel Core i7-13700H, 32GB RAM, 1TB SSD. Perfect for creators and professionals.',
    price: 1899.00,
    inventory: 20,
    category: 'Laptops',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
    tags: ['laptop', 'dell', 'xps', 'productivity'],
    isActive: true,
  },
  {
    sku: 'ELEC-006',
    name: 'Bose SoundLink Revolve+ II',
    description: 'Portable Bluetooth speaker with 360-degree sound. Water and dust resistant with 17-hour battery life.',
    price: 329.00,
    inventory: 45,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    tags: ['speaker', 'bluetooth', 'portable', 'bose'],
    isActive: true,
  },
  {
    sku: 'ELEC-007',
    name: 'Apple Watch Series 9',
    description: 'Advanced health and fitness features. Always-On Retina display. Crash Detection and Emergency SOS.',
    price: 429.00,
    inventory: 60,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    tags: ['smartwatch', 'apple', 'fitness', 'health'],
    isActive: true,
  },
  {
    sku: 'ELEC-008',
    name: 'DJI Mini 3 Pro Drone',
    description: 'Ultra-lightweight foldable drone with 4K HDR video. 34-minute flight time and obstacle avoidance.',
    price: 759.00,
    inventory: 12,
    category: 'Drones',
    imageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500&h=500&fit=crop',
    tags: ['drone', 'dji', 'aerial', '4k'],
    isActive: true,
  },
  {
    sku: 'ELEC-009',
    name: 'Logitech MX Master 3S Mouse',
    description: 'Advanced wireless mouse with MagSpeed scrolling. Customizable buttons and multi-device connectivity.',
    price: 99.99,
    inventory: 80,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
    tags: ['mouse', 'wireless', 'productivity', 'logitech'],
    isActive: true,
  },
  {
    sku: 'ELEC-010',
    name: 'Nintendo Switch OLED',
    description: 'Vibrant 7-inch OLED screen. Enhanced audio and wired LAN port. Play at home or on the go.',
    price: 349.99,
    inventory: 35,
    category: 'Gaming',
    imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&h=500&fit=crop',
    tags: ['gaming', 'nintendo', 'switch', 'console'],
    isActive: true,
  },
  {
    sku: 'ELEC-011',
    name: 'Anker PowerCore 26800mAh',
    description: 'High-capacity portable charger with 3 USB ports. Fast charging technology for phones and tablets.',
    price: 65.99,
    inventory: 100,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500&h=500&fit=crop',
    tags: ['power-bank', 'charger', 'portable', 'anker'],
    isActive: true,
  },
  {
    sku: 'ELEC-012',
    name: 'Philips Hue Starter Kit',
    description: 'Smart lighting kit with 4 color bulbs and bridge. Control with voice or app. 16 million colors.',
    price: 199.99,
    inventory: 40,
    category: 'Smart Home',
    imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=500&h=500&fit=crop',
    tags: ['smart-home', 'lighting', 'philips', 'hue'],
    isActive: true,
  },
];

// Product data for outzidr tenant (outdoor/adventure products)
const outzidrProducts = [
  {
    sku: 'OUT-001',
    name: 'North Face Summit Series Tent',
    description: '4-season mountaineering tent. Weather-resistant with advanced ventilation. Sleeps 2 people comfortably.',
    price: 649.00,
    inventory: 15,
    category: 'Camping',
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500&h=500&fit=crop',
    tags: ['tent', 'camping', 'mountaineering', 'north-face'],
    isActive: true,
  },
  {
    sku: 'OUT-002',
    name: 'Patagonia Down Jacket',
    description: '800-fill premium down insulation. Water-resistant and windproof. Packable design for easy storage.',
    price: 329.00,
    inventory: 50,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=500&fit=crop',
    tags: ['jacket', 'down', 'winter', 'patagonia'],
    isActive: true,
  },
  {
    sku: 'OUT-003',
    name: 'Osprey Atmos 65L Backpack',
    description: 'Award-winning backpacking pack with Anti-Gravity suspension. Ventilated back panel and integrated rain cover.',
    price: 279.00,
    inventory: 30,
    category: 'Backpacks',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    tags: ['backpack', 'hiking', 'osprey', 'camping'],
    isActive: true,
  },
  {
    sku: 'OUT-004',
    name: 'Salomon X Ultra 4 Hiking Boots',
    description: 'All-terrain hiking boots with advanced chassis for stability. Waterproof and breathable Gore-Tex membrane.',
    price: 175.00,
    inventory: 60,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1542280756-74b2f55e73ab?w=500&h=500&fit=crop',
    tags: ['boots', 'hiking', 'waterproof', 'salomon'],
    isActive: true,
  },
  {
    sku: 'OUT-005',
    name: 'MSR PocketRocket 2 Stove',
    description: 'Ultra-compact backpacking stove. Boils 1 liter of water in 3.5 minutes. Weighs only 2.6 oz.',
    price: 49.95,
    inventory: 75,
    category: 'Cooking',
    imageUrl: 'https://images.unsplash.com/photo-1455980493862-0c797537f133?w=500&h=500&fit=crop',
    tags: ['stove', 'camping', 'cooking', 'backpacking'],
    isActive: true,
  },
  {
    sku: 'OUT-006',
    name: 'Hydro Flask 32oz Water Bottle',
    description: 'Insulated stainless steel bottle keeps drinks cold for 24 hours. BPA-free and dishwasher safe.',
    price: 44.95,
    inventory: 120,
    category: 'Hydration',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    tags: ['water-bottle', 'insulated', 'hydration', 'hydro-flask'],
    isActive: true,
  },
  {
    sku: 'OUT-007',
    name: 'Black Diamond Headlamp',
    description: '350-lumen rechargeable headlamp. Multiple lighting modes and red night vision. Waterproof rating IPX4.',
    price: 59.95,
    inventory: 85,
    category: 'Lighting',
    imageUrl: 'https://images.unsplash.com/photo-1609618534369-60d2a17cf096?w=500&h=500&fit=crop',
    tags: ['headlamp', 'camping', 'lighting', 'black-diamond'],
    isActive: true,
  },
  {
    sku: 'OUT-008',
    name: 'REI Co-op Trail 2 Sleeping Bag',
    description: 'Three-season sleeping bag rated to 30°F. Recycled synthetic insulation and water-resistant shell.',
    price: 129.00,
    inventory: 45,
    category: 'Sleep Systems',
    imageUrl: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=500&h=500&fit=crop',
    tags: ['sleeping-bag', 'camping', 'backpacking', 'rei'],
    isActive: true,
  },
  {
    sku: 'OUT-009',
    name: 'Jetboil Flash Cooking System',
    description: 'All-in-one camping stove. Boils water in 100 seconds. Insulated cozy and push-button ignition.',
    price: 109.95,
    inventory: 40,
    category: 'Cooking',
    imageUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=500&h=500&fit=crop',
    tags: ['stove', 'cooking', 'jetboil', 'camping'],
    isActive: true,
  },
  {
    sku: 'OUT-010',
    name: 'Garmin inReach Mini 2',
    description: 'Satellite communicator with GPS. Two-way messaging and SOS features. Perfect for remote adventures.',
    price: 399.99,
    inventory: 25,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=500&h=500&fit=crop',
    tags: ['gps', 'satellite', 'emergency', 'garmin'],
    isActive: true,
  },
  {
    sku: 'OUT-011',
    name: 'Therm-a-Rest Z Lite Sleeping Pad',
    description: 'Closed-cell foam pad for insulation and comfort. Ultralight and durable. Accordion-style for easy packing.',
    price: 44.95,
    inventory: 55,
    category: 'Sleep Systems',
    imageUrl: 'https://images.unsplash.com/photo-1517408229928-7fa01238e96f?w=500&h=500&fit=crop',
    tags: ['sleeping-pad', 'camping', 'ultralight', 'thermarest'],
    isActive: true,
  },
  {
    sku: 'OUT-012',
    name: 'Sea to Summit Dry Sack 20L',
    description: 'Waterproof dry bag with roll-top closure. Ultra-durable for kayaking, rafting, and backpacking.',
    price: 34.95,
    inventory: 90,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=500&h=500&fit=crop',
    tags: ['dry-bag', 'waterproof', 'kayaking', 'sea-to-summit'],
    isActive: true,
  },
];

// Product data for reliance tenant (general retail/groceries)
const relianceProducts = [
  {
    sku: 'REL-001',
    name: 'Organic Mixed Greens Salad',
    description: 'Fresh organic spring mix with baby spinach and arugula. Locally sourced and pesticide-free.',
    price: 4.99,
    inventory: 200,
    category: 'Fresh Produce',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=500&fit=crop',
    tags: ['organic', 'salad', 'fresh', 'healthy'],
    isActive: true,
  },
  {
    sku: 'REL-002',
    name: 'Artisan Sourdough Bread',
    description: 'Freshly baked sourdough with crispy crust. Made with organic flour and natural starter.',
    price: 6.50,
    inventory: 150,
    category: 'Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&h=500&fit=crop',
    tags: ['bread', 'sourdough', 'artisan', 'bakery'],
    isActive: true,
  },
  {
    sku: 'REL-003',
    name: 'Fresh Salmon Fillet',
    description: 'Wild-caught Atlantic salmon. Rich in Omega-3 fatty acids. Sustainably sourced.',
    price: 18.99,
    inventory: 80,
    category: 'Seafood',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&h=500&fit=crop',
    tags: ['salmon', 'seafood', 'fresh', 'protein'],
    isActive: true,
  },
  {
    sku: 'REL-004',
    name: 'Organic Avocados (4-pack)',
    description: 'Ripe Hass avocados perfect for guacamole or toast. Rich in healthy fats and vitamins.',
    price: 7.99,
    inventory: 180,
    category: 'Fresh Produce',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&h=500&fit=crop',
    tags: ['avocado', 'organic', 'healthy', 'fresh'],
    isActive: true,
  },
  {
    sku: 'REL-005',
    name: 'Grass-Fed Ground Beef',
    description: '80/20 lean ground beef from grass-fed cattle. Perfect for burgers and tacos. 1 lb pack.',
    price: 9.99,
    inventory: 120,
    category: 'Meat',
    imageUrl: 'https://images.unsplash.com/photo-1588347818036-f6e1379e2562?w=500&h=500&fit=crop',
    tags: ['beef', 'meat', 'grass-fed', 'protein'],
    isActive: true,
  },
  {
    sku: 'REL-006',
    name: 'Organic Free-Range Eggs',
    description: 'Dozen large eggs from cage-free chickens. Rich golden yolks and superior taste.',
    price: 5.99,
    inventory: 250,
    category: 'Dairy & Eggs',
    imageUrl: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=500&h=500&fit=crop',
    tags: ['eggs', 'organic', 'free-range', 'protein'],
    isActive: true,
  },
  {
    sku: 'REL-007',
    name: 'Aged Cheddar Cheese Block',
    description: 'Sharp white cheddar aged 12 months. Bold flavor perfect for cheese boards. 8 oz block.',
    price: 7.49,
    inventory: 100,
    category: 'Dairy & Eggs',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&h=500&fit=crop',
    tags: ['cheese', 'cheddar', 'dairy', 'aged'],
    isActive: true,
  },
  {
    sku: 'REL-008',
    name: 'Fresh Berry Medley',
    description: 'Mix of strawberries, blueberries, raspberries, and blackberries. Antioxidant-rich and delicious.',
    price: 8.99,
    inventory: 140,
    category: 'Fresh Produce',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&h=500&fit=crop',
    tags: ['berries', 'fresh', 'fruit', 'organic'],
    isActive: true,
  },
  {
    sku: 'REL-009',
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed Italian olive oil. Perfect for cooking and dressing. 500ml bottle.',
    price: 19.99,
    inventory: 95,
    category: 'Pantry',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop',
    tags: ['olive-oil', 'cooking', 'italian', 'pantry'],
    isActive: true,
  },
  {
    sku: 'REL-010',
    name: 'Organic Coffee Beans',
    description: 'Medium roast single-origin beans from Colombia. Fair trade certified. 12 oz bag.',
    price: 12.99,
    inventory: 110,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&h=500&fit=crop',
    tags: ['coffee', 'organic', 'fair-trade', 'beans'],
    isActive: true,
  },
  {
    sku: 'REL-011',
    name: 'Greek Yogurt Plain',
    description: 'Thick and creamy authentic Greek yogurt. High in protein. 32 oz container.',
    price: 5.49,
    inventory: 160,
    category: 'Dairy & Eggs',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=500&fit=crop',
    tags: ['yogurt', 'greek', 'dairy', 'protein'],
    isActive: true,
  },
  {
    sku: 'REL-012',
    name: 'Assorted Nuts Mix',
    description: 'Premium mix of almonds, cashews, walnuts, and pecans. Lightly salted. 16 oz bag.',
    price: 11.99,
    inventory: 130,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500&h=500&fit=crop',
    tags: ['nuts', 'snacks', 'healthy', 'protein'],
    isActive: true,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db!;
    const productsCollection = db.collection('products');
    const tenantsCollection = db.collection('tenants');

    // Get all tenants
    const tenants = await tenantsCollection.find({}).toArray();
    console.log(`Found ${tenants.length} tenants\n`);

    for (const tenant of tenants) {
      console.log(`\n📦 Seeding products for: ${tenant.name} (${tenant.slug})`);
      
      let products = [];
      
      if (tenant.slug === 'electronics') {
        products = electronicsProducts;
      } else if (tenant.slug === 'outzidr') {
        products = outzidrProducts;
      } else if (tenant.slug === 'reliance') {
        products = relianceProducts;
      } else {
        console.log(`  ⚠️  No product data for tenant: ${tenant.slug}, skipping...`);
        continue;
      }

      // Delete existing products for this tenant
      const deleteResult = await productsCollection.deleteMany({ tenantId: tenant.tenantId });
      console.log(`  🗑️  Deleted ${deleteResult.deletedCount} existing products`);

      // Add tenantId to each product
      const productsWithTenant = products.map(product => ({
        ...product,
        tenantId: tenant.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Insert new products
      const insertResult = await productsCollection.insertMany(productsWithTenant);
      console.log(`  ✅ Added ${insertResult.insertedCount} products`);
      
      // Show sample products
      console.log(`  📋 Sample products:`);
      products.slice(0, 3).forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.name} - $${p.price}`);
      });
    }

    console.log('\n\n🎉 Product seeding complete!\n');
    console.log('Summary:');
    console.log('  - Electronics: 12 tech products');
    console.log('  - Outzidr: 12 outdoor/adventure products');
    console.log('  - Reliance: 12 grocery/retail products');
    console.log('\n✨ All products include real Unsplash images!\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
