import fastify, { FastifyInstance } from 'fastify';
import env from '@fastify/env';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';

import { mongoPlugin } from './plugins/mongodb';
import { tenantPlugin } from './plugins/tenant';
import { authGuard, requireAuth } from './plugins/authGuard';
import { authRoutes } from './modules/auth/auth.routes';
import { profileRoutes } from './modules/profile/profile.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true,
  });

  // Sensible plugin for error handling
  await app.register(sensible);

  // Env config
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

  // CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Cookie support
  await app.register(cookie);

  // Core plugins
  await app.register(mongoPlugin);
  await app.register(tenantPlugin);
  await app.register(authGuard);
  await app.register(requireAuth);

  // Routes
  await app.register(authRoutes);
  await app.register(profileRoutes);

  // Health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
}
