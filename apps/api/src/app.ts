import fastify, { FastifyInstance } from 'fastify';
import env from '@fastify/env';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';

import { mongoPlugin } from './plugins/mongodb';
import { tenantPlugin } from './plugins/tenant';

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
      },
    },
  });

  // CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Core plugins
  // MongoDB is optional 
  // await app.register(mongoPlugin);
  await app.register(tenantPlugin);

  // Health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
}
