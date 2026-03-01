import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { tenantService } from '../modules/tenants/tenant.service';

function extractSlugFromHost(host: string | undefined): string | null {
  if (!host) return null;
  
  const hostname = host.split(':')[0];
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  const parts = hostname.split('.');
  
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }
  
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
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

    const headerSlug = request.headers['x-tenant-slug'] as string | undefined;
    if (headerSlug) {
      slug = headerSlug;
    } else {
      const host = request.headers.host;
      slug = extractSlugFromHost(host);
      
      if (!slug) {
        slug = extractSlugFromQuery(request.url);
      }
    }

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
