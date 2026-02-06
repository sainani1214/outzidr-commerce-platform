import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../modules/auth/auth.service';
import { JWTPayload } from '../modules/auth/auth.types';

export const authGuard = fp(async (app: FastifyInstance) => {
  app.decorateRequest('user', null);

  app.addHook('preHandler', async (request) => {
    let token = request.cookies.accessToken;
    
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      request.user = null;
      return;
    }

    try {
      const payload = verifyToken<JWTPayload>(token);

      if (payload.tenantId !== request.tenantId) {
        request.user = null;
        return;
      }

      request.user = payload;
    } catch (err) {
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
