/**
 * Common schema definitions shared across all API endpoints
 */

export const tenantHeaderSchema = {
  $id: 'tenantHeader',
  type: 'object',
  properties: {
    'x-tenant-slug': {
      type: 'string',
      description: 'Tenant slug identifier for multi-tenant isolation',
    },
  },
} as const;

export const CommonSchemas = {
  tenantHeaderSchema,
};
