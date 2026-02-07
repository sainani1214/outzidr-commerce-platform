export const getCartSchema = {
  tags: ['cart'],
  description: 'Get current user cart',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
} as const;

export const addToCartSchema = {
  tags: ['cart'],
  description: 'Add item to cart',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  body: {
    type: 'object',
    required: ['productId', 'quantity'],
    properties: {
      productId: { type: 'string' },
      quantity: { type: 'number' },
    },
  },
} as const;

export const updateCartItemSchema = {
  tags: ['cart'],
  description: 'Update cart item quantity',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  params: {
    type: 'object',
    properties: {
      productId: { type: 'string' },
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

export const removeFromCartSchema = {
  tags: ['cart'],
  description: 'Remove item from cart',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
  params: {
    type: 'object',
    properties: {
      productId: { type: 'string' },
    },
  },
} as const;

export const clearCartSchema = {
  tags: ['cart'],
  description: 'Clear entire cart',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
} as const;
