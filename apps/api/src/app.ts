import fastify, { FastifyInstance } from 'fastify';
import env from '@fastify/env';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';

import { mongoPlugin } from './plugins/mongodb';
import { tenantPlugin } from './plugins/tenant';
import { authGuard, requireAuth } from './plugins/authGuard';
import { authRoutes } from './modules/auth/auth.routes';
import { protectedRoutes } from './routes/protected.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true,
  });

  // Error handling
  await app.register(sensible);

  // Environment configuration
  await app.register(env, {
    dotenv: true,
    schema: {
      type: 'object',
      required: [],
      properties: {
        MONGODB_URI: { type: 'string' },
        JWT_PRIVATE_KEY: { type: 'string' },
        JWT_PUBLIC_KEY: { type: 'string' },
      },
    },
  });

  // HTTP middleware
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(cookie);

  // Database & core plugins
  await app.register(mongoPlugin);
  await app.register(tenantPlugin);
  await app.register(authGuard);
  await app.register(requireAuth);

  // API routes
  const API_PREFIX = '/api';
  await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await app.register(protectedRoutes, { prefix: API_PREFIX });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
}
