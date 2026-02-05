import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../modules/auth/auth.service';
import { JWTPayload } from '../modules/auth/auth.types';

export const authGuard = fp(async (app: FastifyInstance) => {
  app.decorateRequest('user', null);

  app.addHook('preHandler', async (request) => {
    const token = request.cookies.accessToken;
    
    if (!token) {
      request.user = null;
      return;
    }

    try {
      const payload = verifyToken<JWTPayload>(token);

      if (payload.tenantId !== request.tenantId) {
        app.log.warn({ tokenTenant: payload.tenantId, requestTenant: request.tenantId }, 'Tenant mismatch');
        request.user = null;
        return;
      }

      request.user = payload;
    } catch (err) {
      app.log.debug({ err }, 'Token verification failed');
      request.user = null;
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}

export const requireAuth = fp(async (app: FastifyInstance) => {
  app.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
  });
});
