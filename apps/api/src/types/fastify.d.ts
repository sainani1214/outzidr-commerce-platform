import 'fastify';
import { FastifyInstance as OriginalFastifyInstance } from 'fastify';
import mongoose from 'mongoose';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: typeof mongoose;
    config: {
      MONGODB_URI?: string;
      JWT_PRIVATE_KEY?: string;
      JWT_PUBLIC_KEY?: string;
    };
  }
}
