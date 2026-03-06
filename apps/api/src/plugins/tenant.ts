import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { tenantService } from '../modules/tenants/tenant.service';
import { TenantModel } from '../modules/tenants/tenant.model';

function extractSlugFromHost(host: string | undefined): string | null {
  if (!host) return null;
  
  const hostname = host.split(':')[0];
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  const parts = hostname.split('.');
  
  // Handle *.localhost for development
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }
  
  // Handle subdomains (e.g., electronics.outzidr.com)
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
}

async function resolveCustomDomain(hostname: string): Promise<string | null> {
  try {
    // Look up tenant by custom domain in metadata
    const tenant = await TenantModel.findOne({
      'metadata.customDomain': hostname,
      isActive: true
    }).lean();
    
    if (tenant) {
      return tenant.slug;
    }
    
    // Also check without www prefix
    const withoutWww = hostname.replace(/^www\./, '');
    const tenantWithoutWww = await TenantModel.findOne({
      'metadata.customDomain': withoutWww,
      isActive: true
    }).lean();
    
    return tenantWithoutWww?.slug || null;
  } catch (error) {
    console.error('Error resolving custom domain:', error);
    return null;
  }
}

function extractSlugFromQuery(url: string): string | null {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return null;
  
  const queryString = url.substring(queryIndex + 1);
  const params = new URLSearchParams(queryString);
  return params.get('tenant');
}

export const tenantPlugin = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    if (
      request.url === '/health' ||
      request.url.startsWith('/documentation') ||
      request.url.startsWith('/docs') ||
      request.url.includes('swagger') ||
      request.url.includes('openapi')
    ) {
      request.tenantId = 'system';
      return;
    }

    if (request.url.startsWith('/api/v1/tenants') && request.method === 'POST') {
      request.tenantId = 'system';
      return;
    }

    if (request.url.includes('/tenants/resolve/') && request.method === 'GET') {
      request.tenantId = 'system';
      return;
    }

    let slug: string | null = null;

    // Priority 1: Check for explicit tenant header
    const headerSlug = request.headers['x-tenant-slug'] as string | undefined;
    if (headerSlug) {
      slug = headerSlug;
    } else {
      const host = request.headers.host;
      
      // Priority 2: Try to extract slug from subdomain
      slug = extractSlugFromHost(host);
      
      // Priority 3: If no subdomain, check if it's a custom domain
      if (!slug && host) {
        const hostname = host.split(':')[0];
        slug = await resolveCustomDomain(hostname);
      }
      
      // Priority 4: Check query parameter
      if (!slug) {
        slug = extractSlugFromQuery(request.url);
      }
    }

    // Default to 'default' tenant if nothing found
    if (!slug) {
      slug = 'default';
    }

    const tenantId = await tenantService.resolveSlugToTenantId(slug);

    if (!tenantId) {
      return reply.code(400).send({ 
        error: 'Invalid tenant', 
        slug,
        message: `Tenant with slug "${slug}" not found. Please contact support.`
      });
    }

    request.tenantId = tenantId;
  });
});
