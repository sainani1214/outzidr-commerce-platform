import { TenantModel, ITenantDocument } from './tenant.model';
import { CreateTenantDTO, UpdateTenantDTO, TenantQuery, PaginatedTenants, Tenant } from './tenant.types';
import { ConflictError, NotFoundError } from '../../utils/errors';

class TenantService {
  private slugToTenantIdCache: Map<string, string> = new Map();

  async createTenant(data: CreateTenantDTO): Promise<Tenant> {
    const existingSlug = await TenantModel.findOne({ slug: data.slug });
    if (existingSlug) {
      throw new ConflictError('Tenant with this slug already exists');
    }

    const existingName = await TenantModel.findOne({ name: data.name });
    if (existingName) {
      throw new ConflictError('Tenant with this name already exists');
    }

    const tenant = new TenantModel({
      slug: data.slug,
      name: data.name,
      metadata: data.metadata || {},
      isActive: true,
    });

    await tenant.save();
    this.slugToTenantIdCache.set(tenant.slug, tenant.tenantId);
    return tenant.toTenantObject();
  }

  async resolveSlugToTenantId(slug: string): Promise<string | null> {
    if (this.slugToTenantIdCache.has(slug)) {
      return this.slugToTenantIdCache.get(slug)!;
    }

    const tenant = await TenantModel.findOne({ slug, isActive: true });
    
    if (!tenant) {
      return null;
    }

    this.slugToTenantIdCache.set(slug, tenant.tenantId);
    return tenant.tenantId;
  }

  async getTenantBySlug(slug: string): Promise<Tenant> {
    const tenant = await TenantModel.findOne({ slug, isActive: true });
    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }
    return tenant.toTenantObject();
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    const tenant = await TenantModel.findOne({ tenantId, isActive: true });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    return tenant.toTenantObject();
  }

  async getTenantByIdInternal(tenantId: string): Promise<ITenantDocument | null> {
    return TenantModel.findOne({ tenantId });
  }

  async getTenants(query: TenantQuery): Promise<PaginatedTenants> {
    const {
      page = 1,
      limit = 20,
      isActive,
      search,
    } = query;

    const filter: any = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      TenantModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TenantModel.countDocuments(filter),
    ]);

    return {
      tenants: tenants.map((t) => t.toTenantObject()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateTenant(tenantId: string, data: UpdateTenantDTO): Promise<Tenant> {
    const tenant = await TenantModel.findOne({ tenantId });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    if (data.slug !== undefined && data.slug !== tenant.slug) {
      const existingSlug = await TenantModel.findOne({
        slug: data.slug,
        tenantId: { $ne: tenantId },
      });

      if (existingSlug) {
        throw new ConflictError('Tenant with this slug already exists');
      }

      this.slugToTenantIdCache.delete(tenant.slug);
      tenant.slug = data.slug;
      this.slugToTenantIdCache.set(data.slug, tenant.tenantId);
    }

    if (data.name !== undefined) {
      const existingTenant = await TenantModel.findOne({
        name: data.name,
        tenantId: { $ne: tenantId },
      });

      if (existingTenant) {
        throw new ConflictError('Tenant with this name already exists');
      }

      tenant.name = data.name;
    }

    if (data.metadata !== undefined) {
      tenant.metadata = { ...tenant.metadata, ...data.metadata };
    }

    if (data.isActive !== undefined) {
      tenant.isActive = data.isActive;
      if (!data.isActive) {
        this.slugToTenantIdCache.delete(tenant.slug);
      }
    }

    await tenant.save();
    return tenant.toTenantObject();
  }

  async deleteTenant(tenantId: string): Promise<void> {
    const tenant = await TenantModel.findOne({ tenantId });

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    tenant.isActive = false;
    this.slugToTenantIdCache.delete(tenant.slug);
    await tenant.save();
  }

  async validateTenant(tenantId: string): Promise<boolean> {
    const tenant = await TenantModel.findOne({ tenantId, isActive: true });
    return !!tenant;
  }

  async ensureDefaultTenant(): Promise<Tenant> {
    const defaultSlug = 'default';
    const defaultTenantId = 'tenant_default';
    let tenant = await TenantModel.findOne({ slug: defaultSlug });

    if (!tenant) {
      tenant = new TenantModel({
        tenantId: defaultTenantId,
        slug: defaultSlug,
        name: 'Default Organization',
        metadata: {
          type: 'default',
          description: 'Default tenant for regular users',
        },
        isActive: true,
      });
      await tenant.save();
      this.slugToTenantIdCache.set(defaultSlug, tenant.tenantId);
    }

    return tenant.toTenantObject();
  }

  clearCache(): void {
    this.slugToTenantIdCache.clear();
  }
}

export const tenantService = new TenantService();
