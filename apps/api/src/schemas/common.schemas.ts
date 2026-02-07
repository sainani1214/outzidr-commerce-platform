/**
 * Common schema definitions shared across all API endpoints
 */

export const tenantHeaderSchema = {
  $id: 'tenantHeader',
  type: 'object',
  properties: {
    'x-tenant-id': {
      type: 'string',
      description: 'Tenant identifier for multi-tenant isolation',
    },
  },
  required: ['x-tenant-id'],
} as const;

export const CommonSchemas = {
  tenantHeaderSchema,
};
