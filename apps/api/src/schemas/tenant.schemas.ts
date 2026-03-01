export const createTenantSchema = {
  body: {
    type: 'object',
    required: ['name', 'slug'],
    properties: {
      slug: {
        type: 'string',
        pattern: '^[a-z0-9-]+$',
        minLength: 2,
        maxLength: 50,
      },
      name: { 
        type: 'string',
        minLength: 1,
        maxLength: 255,
      },
      metadata: { 
        type: 'object',
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string' },
        slug: { type: 'string' },
        name: { type: 'string' },
        metadata: { type: 'object' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const resolveTenantSlugSchema = {
  params: {
    type: 'object',
    required: ['slug'],
    properties: {
      slug: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string' },
        slug: { type: 'string' },
        name: { type: 'string' },
        metadata: { type: 'object' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const getTenantSchema = {
  params: {
    type: 'object',
    required: ['tenantId'],
    properties: {
      tenantId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string' },
        slug: { type: 'string' },
        name: { type: 'string' },
        metadata: { type: 'object' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const getTenantsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      isActive: { type: 'boolean' },
      search: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        tenants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              tenantId: { type: 'string' },
              slug: { type: 'string' },
              name: { type: 'string' },
              metadata: { type: 'object' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  },
};

export const updateTenantSchema = {
  params: {
    type: 'object',
    required: ['tenantId'],
    properties: {
      tenantId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        pattern: '^[a-z0-9-]+$',
        minLength: 2,
        maxLength: 50,
      },
      name: { 
        type: 'string',
        minLength: 1,
        maxLength: 255,
      },
      metadata: { type: 'object' },
      isActive: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string' },
        slug: { type: 'string' },
        name: { type: 'string' },
        metadata: { type: 'object' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const deleteTenantSchema = {
  params: {
    type: 'object',
    required: ['tenantId'],
    properties: {
      tenantId: { type: 'string' },
    },
  },
  response: {
    204: {
      type: 'null',
    },
  },
};
