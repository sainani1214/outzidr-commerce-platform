#!/usr/bin/env node

/**
 * Example: Create a new tenant via API
 * 
 * Usage:
 *   node examples/create-tenant-api.js fashion "Fashion Store" '{"industry":"fashion","currency":"USD"}'
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

async function createTenant(slug, name, metadata = {}) {
  try {
    console.log(`\n🔧 Creating tenant: ${name} (slug: ${slug})\n`);

    const response = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        name,
        metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error creating tenant:', data);
      process.exit(1);
    }

    console.log('✅ Tenant created successfully!\n');
    console.log('📋 Details:');
    console.log('  - Tenant ID:', data.tenantId);
    console.log('  - Slug:', data.slug);
    console.log('  - Name:', data.name);
    console.log('  - Status:', data.isActive ? '✓ Active' : '✗ Inactive');
    console.log('  - Metadata:', JSON.stringify(data.metadata, null, 2));
    console.log('\n🌐 Access URLs:');
    console.log(`  - Development: http://${slug}.localhost:3000`);
    console.log(`  - Production: https://${slug}.outzidr.com`);
    console.log('\n✨ Users can now register and use this tenant!\n');

  } catch (error) {
    console.error('❌ Failed to create tenant:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const [slug, name, metadata] = process.argv.slice(2);

if (!slug || !name) {
  console.log(`
Usage: node examples/create-tenant-api.js <slug> <name> [metadata]

Examples:
  node examples/create-tenant-api.js fashion "Fashion Store"
  node examples/create-tenant-api.js electronics "Electronics Hub" '{"industry":"electronics","currency":"USD"}'
  `);
  process.exit(1);
}

createTenant(slug, name, metadata);
