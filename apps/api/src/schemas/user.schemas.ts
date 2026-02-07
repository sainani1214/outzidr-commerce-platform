export const getCurrentUserSchema = {
  tags: ['users'],
  description: 'Get current authenticated user profile',
  security: [{ bearerAuth: [] }],
  headers: { $ref: 'tenantHeader#' },
} as const;
