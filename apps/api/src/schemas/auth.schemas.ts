export const registerSchema = {
  tags: ['auth'],
  description: 'Register a new user',
  headers: {
    type: 'object',
    required: ['x-tenant-id'],
    properties: {
      'x-tenant-id': { 
        type: 'string',
        description: 'Tenant identifier',
      },
    },
  },
  body: {
    type: 'object',
    required: ['email', 'password', 'confirmPassword', 'name'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      confirmPassword: { type: 'string', minLength: 8 },
      name: { type: 'string', minLength: 1 },
    },
  },
} as const;

export const loginSchema = {
  tags: ['auth'],
  description: 'Login with email and password',
  headers: {
    type: 'object',
    required: ['x-tenant-id'],
    properties: {
      'x-tenant-id': { 
        type: 'string',
        description: 'Tenant identifier',
      },
    },
  },
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
} as const;

export const refreshTokenSchema = {
  tags: ['auth'],
  description: 'Refresh access token',
  headers: {
    type: 'object',
    required: ['x-tenant-id'],
    properties: {
      'x-tenant-id': { 
        type: 'string',
        description: 'Tenant identifier',
      },
    },
  },
} as const;

export const logoutSchema = {
  tags: ['auth'],
  description: 'Logout and revoke refresh token',
  headers: {
    type: 'object',
    required: ['x-tenant-id'],
    properties: {
      'x-tenant-id': { 
        type: 'string',
        description: 'Tenant identifier',
      },
    },
  },
} as const;
