import '@fastify/rate-limit';

declare module 'fastify' {
  interface FastifyContextConfig {
    rateLimit?: {
      max?: number;
      timeWindow?: string | number;
      cache?: number;
      allowList?: string[] | ((req: any) => boolean);
      continueExceeding?: boolean;
      skipOnError?: boolean;
    };
  }
}
