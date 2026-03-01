import { FastifyInstance } from 'fastify';
import { tenantController } from './tenant.controller';
import {
  createTenantSchema,
  getTenantSchema,
  getTenantsSchema,
  updateTenantSchema,
  deleteTenantSchema,
  resolveTenantSlugSchema,
} from '../../schemas/tenant.schemas';

export async function tenantRoutes(app: FastifyInstance) {
  app.post(
    '/tenants',
    {
      schema: createTenantSchema,
    },
    tenantController.createTenant.bind(tenantController)
  );

  app.get(
    '/tenants/resolve/:slug',
    {
      schema: resolveTenantSlugSchema,
    },
    tenantController.resolveTenantSlug.bind(tenantController)
  );

  app.get(
    '/tenants',
    {
      schema: getTenantsSchema,
    },
    tenantController.getTenants.bind(tenantController)
  );

  app.get(
    '/tenants/:tenantId',
    {
      schema: getTenantSchema,
    },
    tenantController.getTenant.bind(tenantController)
  );

  app.put(
    '/tenants/:tenantId',
    {
      schema: updateTenantSchema,
    },
    tenantController.updateTenant.bind(tenantController)
  );

  app.delete(
    '/tenants/:tenantId',
    {
      schema: deleteTenantSchema,
    },
    tenantController.deleteTenant.bind(tenantController)
  );
}
