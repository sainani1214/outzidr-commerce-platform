/**
 * Route configuration for authentication endpoints
 * Includes rate limiting, security, and route-specific settings
 */

export const authRouteConfig = {
  register: {
    rateLimit: {
      max: 5,
      timeWindow: '1 minute',
    },
  },
  login: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute',
    },
  },
  refresh: {
    rateLimit: {
      max: 20,
      timeWindow: '1 minute',
    },
  },
  logout: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute',
    },
  },
} as const;
