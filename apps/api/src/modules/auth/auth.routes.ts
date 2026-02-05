import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", authController.register.bind(authController));
  app.post("/auth/login", authController.login.bind(authController));
  app.post("/auth/refresh", authController.refresh.bind(authController));
  app.post("/auth/logout", authController.logout.bind(authController));
}
