import { FastifyInstance } from 'fastify';
import * as controller from './user.controller';

export async function userRoutes(app: FastifyInstance) {
  app.get('/me', controller.getCurrentUser);
}
