import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { tenantService } from '../modules/tenants/tenant.service';

export const mongoPlugin = fp(async (app: FastifyInstance) => {
  const uri = app.config.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // Skip connection if mongoose is already connected (e.g., in tests)
  if (mongoose.connection.readyState === 1) {
    app.log.info('MongoDB already connected (using existing connection)');
    app.decorate('mongo', mongoose);
    // Ensure default tenant exists
    await tenantService.ensureDefaultTenant();
    app.log.info('Default tenant verified');
    return;
  }

  await mongoose.connect(uri);

  app.log.info('MongoDB connected');

  // Ensure default tenant exists
  await tenantService.ensureDefaultTenant();
  app.log.info('Default tenant created/verified');

  app.decorate('mongo', mongoose);
});
