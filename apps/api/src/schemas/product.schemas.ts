export const createProductSchema = {
  tags: ['products'],
  description: 'Create a new product',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  body: {
    type: 'object',
    required: ['sku', 'name', 'price', 'inventory'],
    properties: {
      sku: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      inventory: { type: 'number' },
      category: { type: 'string' },
      imageUrl: { type: 'string', description: 'Product image URL' },
      tags: { type: 'array', items: { type: 'string' } },
    },
  },
} as const;

export const getProductsSchema = {
  tags: ['products'],
  description: 'List products with pagination and filters',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', default: 1 },
      limit: { type: 'number', default: 10 },
      category: { type: 'string' },
      search: { type: 'string' },
      isActive: { type: 'boolean' },
    },
  },
} as const;

export const getProductByIdSchema = {
  tags: ['products'],
  description: 'Get product by ID',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
} as const;

export const getProductBySkuSchema = {
  tags: ['products'],
  description: 'Get product by SKU',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  params: {
    type: 'object',
    properties: {
      sku: { type: 'string' },
    },
  },
} as const;

export const updateProductSchema = {
  tags: ['products'],
  description: 'Update product',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      category: { type: 'string' },
      imageUrl: { type: 'string', description: 'Product image URL' },
      tags: { type: 'array', items: { type: 'string' } },
      isActive: { type: 'boolean' },
    },
  },
} as const;

export const updateInventorySchema = {
  tags: ['products'],
  description: 'Update product inventory',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['quantity'],
    properties: {
      quantity: { type: 'number' },
    },
  },
} as const;

export const deleteProductSchema = {
  tags: ['products'],
  description: 'Delete product',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
} as const;
