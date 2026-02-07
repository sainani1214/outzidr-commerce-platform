export const createOrderSchema = {
  tags: ['orders'],
  description: 'Create new order from cart',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['shippingAddress'],
    properties: {
      shippingAddress: {
        type: 'object',
        required: ['name', 'addressLine1', 'city', 'state', 'postalCode', 'country', 'phone'],
        properties: {
          name: { type: 'string' },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' },
        },
      },
    },
  },
} as const;

export const getOrdersSchema = {
  tags: ['orders'],
  description: 'Get user orders',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', default: 1 },
      limit: { type: 'number', default: 10 },
      status: { 
        type: 'string', 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] 
      },
    },
  },
} as const;

export const getOrderByIdSchema = {
  tags: ['orders'],
  description: 'Get order by ID',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
} as const;

export const updateOrderStatusSchema = {
  tags: ['orders'],
  description: 'Update order status',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      },
    },
  },
} as const;
