import fastify, { FastifyInstance } from 'fastify';
import env from '@fastify/env';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import { API_BASE } from './config/api';
import { registerSwagger } from './config/swagger';
import { errorHandler } from './plugins/errorHandler';
import { mongoPlugin } from './plugins/mongodb';
import { tenantPlugin } from './plugins/tenant';
import { authGuard, requireAuth } from './plugins/authGuard';
import { authRoutes } from './modules/auth/auth.routes';
import { protectedRoutes } from './routes/protected.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true,
  });

  // Global error handler 
  await app.register(errorHandler);

  // Error handling utilities
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

  // Swagger/OpenAPI Documentation
  await registerSwagger(app);

  // Rate limiting (disabled in test environment)
  // Global rate limit is VERY lenient - auth endpoints have their own strict limits
  if (process.env.NODE_ENV !== 'test') {
    await app.register(rateLimit, {
      max: 1000,
      timeWindow: '15 minutes',
      keyGenerator: (req) => {
        return `${req.ip}:${req.headers['x-tenant-id'] || 'unknown'}`;
      },
      errorResponseBuilder: (req, context) => {
        return {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: context.after,
        };
      },
    });
  }

  // Database & core plugins
  await app.register(mongoPlugin);
  await app.register(tenantPlugin);
  await app.register(authGuard);
  await app.register(requireAuth);

  // Register routes with versioned prefix
  await app.register(authRoutes, { prefix: `${API_BASE}/auth` });
  await app.register(protectedRoutes, { prefix: API_BASE });

  // Health check (unversioned)
  app.get(
    '/health',
    {
      schema: { hide: true }
    },
    async () => {
      return { status: 'ok' };
    }
  );

  return app;
}
