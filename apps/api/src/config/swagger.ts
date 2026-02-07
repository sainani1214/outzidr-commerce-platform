import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Outzidr Commerce Platform API',
        description: 'Multi-tenant e-commerce backend with dynamic pricing engine',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3001/api/v1',
          description: 'Development server (v1)',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'products', description: 'Product management' },
        { name: 'cart', description: 'Shopping cart operations' },
        { name: 'orders', description: 'Order management' },
        { name: 'users', description: 'User management' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT access token from /api/auth/login',
          },
        },
        parameters: {
          tenantId: {
            name: 'x-tenant-id',
            in: 'header',
            required: true,
            description: 'Tenant identifier for multi-tenant isolation',
            schema: {
              type: 'string',
              example: 'tenant_1',
            },
          },
        },
      },
      security: [],
    },
    transform: ({ schema, url }) => {
      if (url === '/health') {
        return { schema: { ...schema, hide: true }, url };
      }
      return { schema, url };
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}
