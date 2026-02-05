import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

export const mongoPlugin = fp(async (app: FastifyInstance) => {
  const uri = app.config.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(uri);

  app.log.info('MongoDB connected');

  app.decorate('mongo', mongoose);
});
