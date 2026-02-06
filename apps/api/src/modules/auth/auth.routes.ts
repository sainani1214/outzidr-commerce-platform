import { FastifyInstance } from "fastify";
import * as controller from "./auth.controller";
import { AuthSchemas } from "../../schemas";
import { authRouteConfig } from "./auth.config";

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', {
    schema: AuthSchemas.registerSchema,
    config: authRouteConfig.register,
  }, controller.register);

  app.post('/login', {
    schema: AuthSchemas.loginSchema,
    config: authRouteConfig.login,
  }, controller.login);

  app.post('/refresh', {
    schema: AuthSchemas.refreshTokenSchema,
    config: authRouteConfig.refresh,
  }, controller.refresh);

  app.post('/logout', {
    schema: AuthSchemas.logoutSchema,
    config: authRouteConfig.logout,
  }, controller.logout);
}
