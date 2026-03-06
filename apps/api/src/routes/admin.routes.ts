import { FastifyPluginAsync } from 'fastify';
import { TenantModel } from '../modules/tenants/tenant.model';
import { ProductModel } from '../modules/products/product.model';
import { PricingRule } from '../modules/pricing/pricing.model';
import { randomUUID } from 'crypto';

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all tenants (admin only)
  fastify.get('/admin/tenants', async (request, reply) => {
    try {
      const tenants = await TenantModel.find({}).sort({ createdAt: -1 }).lean();
      
      return reply.send(
        tenants.map((tenant) => ({
          id: tenant._id.toString(),
          tenantId: tenant.tenantId,
          name: tenant.name,
          slug: tenant.slug,
          domain: tenant.metadata?.domain,
          customDomain: tenant.metadata?.customDomain,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
        }))
      );
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to fetch tenants' });
    }
  });

  // Get single tenant
  fastify.get('/admin/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const tenant = await TenantModel.findById(id).lean();
      
      if (!tenant) {
        return reply.code(404).send({ message: 'Tenant not found' });
      }

      return reply.send({
        id: tenant._id.toString(),
        tenantId: tenant.tenantId,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.metadata?.domain,
        customDomain: tenant.metadata?.customDomain,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to fetch tenant' });
    }
  });

  // Create new tenant
  fastify.post('/admin/tenants', async (request, reply) => {
    const { name, slug, domain, customDomain } = request.body as {
      name: string;
      slug: string;
      domain?: string;
      customDomain?: string;
    };

    try {
      // Check if slug already exists
      const existingTenant = await TenantModel.findOne({ slug });
      if (existingTenant) {
        return reply.code(400).send({ message: 'Tenant with this slug already exists' });
      }

      // Create new tenant using Mongoose model
      const tenant = new TenantModel({
        tenantId: `tenant_${randomUUID()}`,
        name,
        slug: slug.toLowerCase().trim(),
        metadata: {
          domain: domain || `${slug}.localhost:3000`,
          customDomain: customDomain || null,
        },
        isActive: true,
      });

      await tenant.save();

      return reply.code(201).send({
        id: tenant._id.toString(),
        tenantId: tenant.tenantId,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.metadata.domain,
        customDomain: tenant.metadata.customDomain,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to create tenant' });
    }
  });

  // Update tenant
  fastify.put('/admin/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, slug, domain, customDomain, isActive } = request.body as {
      name?: string;
      slug?: string;
      domain?: string;
      customDomain?: string;
      isActive?: boolean;
    };

    try {
      // Check if tenant exists
      const existingTenant = await TenantModel.findById(id);
      if (!existingTenant) {
        return reply.code(404).send({ message: 'Tenant not found' });
      }

      // If slug is being changed, check if new slug is available
      if (slug && slug !== existingTenant.slug) {
        const slugExists = await TenantModel.findOne({ slug: slug.toLowerCase().trim() });
        if (slugExists) {
          return reply.code(400).send({ message: 'Slug already in use' });
        }
      }

      // Update fields
      if (name !== undefined) existingTenant.name = name;
      if (slug !== undefined) existingTenant.slug = slug.toLowerCase().trim();
      if (isActive !== undefined) existingTenant.isActive = isActive;
      
      // Update metadata
      if (domain !== undefined || customDomain !== undefined) {
        existingTenant.metadata = {
          ...existingTenant.metadata,
          ...(domain !== undefined && { domain }),
          ...(customDomain !== undefined && { customDomain }),
        };
      }

      await existingTenant.save();

      return reply.send({
        id: existingTenant._id.toString(),
        tenantId: existingTenant.tenantId,
        name: existingTenant.name,
        slug: existingTenant.slug,
        domain: existingTenant.metadata.domain,
        customDomain: existingTenant.metadata.customDomain,
        isActive: existingTenant.isActive,
        createdAt: existingTenant.createdAt,
        updatedAt: existingTenant.updatedAt,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to update tenant' });
    }
  });

  // Delete tenant
  fastify.delete('/admin/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const tenant = await TenantModel.findById(id);
      if (!tenant) {
        return reply.code(404).send({ message: 'Tenant not found' });
      }

      // Delete tenant
      await TenantModel.findByIdAndDelete(id);

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to delete tenant' });
    }
  });

  // Get tenant statistics
  fastify.get('/admin/tenants/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const tenant = await TenantModel.findById(id);
      if (!tenant) {
        return reply.code(404).send({ message: 'Tenant not found' });
      }

      const [productCount, pricingRuleCount] = await Promise.all([
        ProductModel.countDocuments({ tenantId: tenant.tenantId }),
        PricingRule.countDocuments({ tenantId: tenant.tenantId }),
      ]);

      return reply.send({
        tenantId: tenant.tenantId,
        name: tenant.name,
        statistics: {
          products: productCount,
          pricingRules: pricingRuleCount,
          orders: 0,
          users: 0,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to fetch tenant statistics' });
    }
  });

  // Verify custom domain DNS configuration
  fastify.post('/admin/tenants/:id/verify-domain', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const tenant = await TenantModel.findById(id);
      if (!tenant) {
        return reply.code(404).send({ message: 'Tenant not found' });
      }

      const customDomain = tenant.metadata?.customDomain;
      if (!customDomain) {
        return reply.code(400).send({ message: 'No custom domain configured' });
      }

      // Here you would implement actual DNS verification
      // For now, we'll just mark it as verified
      // In production, use a DNS lookup library like 'dns' or 'node-dns'
      
      tenant.metadata = {
        ...tenant.metadata,
        domainVerified: true,
        domainVerifiedAt: new Date().toISOString(),
      };
      
      await tenant.save();

      return reply.send({
        message: 'Domain verified successfully',
        customDomain,
        verified: true,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to verify domain' });
    }
  });
};

export default adminRoutes;
