import { FastifyInstance } from 'fastify';
import * as controller from './user.controller';
import { UserSchemas } from '../../schemas';

export async function userRoutes(app: FastifyInstance) {
  app.get('/me', { schema: UserSchemas.getCurrentUserSchema }, controller.getCurrentUser);
}
