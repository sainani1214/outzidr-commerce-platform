import 'fastify';
import { JWTPayload } from '../modules/auth/auth.types';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string;
    user: JWTPayload | null;
  }
}
