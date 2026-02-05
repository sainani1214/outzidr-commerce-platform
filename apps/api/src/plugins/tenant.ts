import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest } from 'fastify';

export const tenantPlugin = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    // Skip tenant validation for health check endpoint
    if (request.url === '/health') {
      request.tenantId = 'system';
      return;
    }

    const tenantId = request.headers['x-tenant-id'] as string | undefined;

    if (!tenantId || typeof tenantId !== 'string') {
      return reply.code(400).send({ error: 'x-tenant-id header missing' });
    }

    request.tenantId = tenantId;
  });
});
