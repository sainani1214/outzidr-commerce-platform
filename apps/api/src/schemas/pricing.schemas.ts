export const createPricingRuleSchema = {
  body: {
    type: 'object',
    required: ['name', 'discountType', 'discountValue'],
    properties: {
      productId: { type: 'string' },
      name: { 
        type: 'string',
        minLength: 1,
        maxLength: 255,
      },
      discountType: { 
        type: 'string',
        enum: ['PERCENTAGE', 'FLAT', 'INVENTORY_BASED'],
      },
      discountValue: { 
        type: 'number',
        minimum: 0,
      },
      conditions: {
        type: 'object',
        properties: {
          minInventory: { type: 'number', minimum: 0 },
          maxInventory: { type: 'number', minimum: 0 },
          minQuantity: { type: 'number', minimum: 0 },
          maxQuantity: { type: 'number', minimum: 0 },
          validFrom: { type: 'string', format: 'date-time' },
          validUntil: { type: 'string', format: 'date-time' },
        },
      },
      isActive: { type: 'boolean' },
      priority: { type: 'number' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string' },
        productId: { type: 'string' },
        name: { type: 'string' },
        discountType: { type: 'string' },
        discountValue: { type: 'number' },
        conditions: { type: 'object' },
        isActive: { type: 'boolean' },
        priority: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const getPricingRulesSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      productId: { type: 'string' },
      isActive: { type: 'boolean' },
      discountType: { type: 'string', enum: ['PERCENTAGE', 'FLAT', 'INVENTORY_BASED'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              tenantId: { type: 'string' },
              productId: { type: 'string' },
              name: { type: 'string' },
              discountType: { type: 'string' },
              discountValue: { type: 'number' },
              conditions: { type: 'object' },
              isActive: { type: 'boolean' },
              priority: { type: 'number' },
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

export const getPricingRuleSchema = {
  params: {
    type: 'object',
    required: ['ruleId'],
    properties: {
      ruleId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string' },
        productId: { type: 'string' },
        name: { type: 'string' },
        discountType: { type: 'string' },
        discountValue: { type: 'number' },
        conditions: { type: 'object' },
        isActive: { type: 'boolean' },
        priority: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const updatePricingRuleSchema = {
  params: {
    type: 'object',
    required: ['ruleId'],
    properties: {
      ruleId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { 
        type: 'string',
        minLength: 1,
        maxLength: 255,
      },
      discountType: { 
        type: 'string',
        enum: ['PERCENTAGE', 'FLAT', 'INVENTORY_BASED'],
      },
      discountValue: { 
        type: 'number',
        minimum: 0,
      },
      conditions: {
        type: 'object',
        properties: {
          minInventory: { type: 'number', minimum: 0 },
          maxInventory: { type: 'number', minimum: 0 },
          minQuantity: { type: 'number', minimum: 0 },
          maxQuantity: { type: 'number', minimum: 0 },
          validFrom: { type: 'string', format: 'date-time' },
          validUntil: { type: 'string', format: 'date-time' },
        },
      },
      isActive: { type: 'boolean' },
      priority: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tenantId: { type: 'string' },
        productId: { type: 'string' },
        name: { type: 'string' },
        discountType: { type: 'string' },
        discountValue: { type: 'number' },
        conditions: { type: 'object' },
        isActive: { type: 'boolean' },
        priority: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  },
};

export const deletePricingRuleSchema = {
  params: {
    type: 'object',
    required: ['ruleId'],
    properties: {
      ruleId: { type: 'string' },
    },
  },
  response: {
    204: {
      type: 'null',
    },
  },
};

export const calculatePriceSchema = {
  body: {
    type: 'object',
    required: ['productId', 'quantity', 'basePrice', 'inventory'],
    properties: {
      productId: { type: 'string' },
      quantity: { type: 'number', minimum: 1 },
      basePrice: { type: 'number', minimum: 0 },
      inventory: { type: 'number', minimum: 0 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        originalPrice: { type: 'number' },
        finalPrice: { type: 'number' },
        discountAmount: { type: 'number' },
        appliedRules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ruleId: { type: 'string' },
              ruleName: { type: 'string' },
              discountType: { type: 'string' },
              discountValue: { type: 'number' },
            },
          },
        },
      },
    },
  },
};
