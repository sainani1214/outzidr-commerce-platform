import { FastifyInstance } from "fastify";
import * as controller from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
  }, controller.register);

  app.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
  }, controller.login);

  app.post('/refresh', controller.refresh);
  app.post('/logout', controller.logout);
}
