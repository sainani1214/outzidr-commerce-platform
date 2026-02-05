import { FastifyInstance } from "fastify";
import * as controller from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", controller.register);
  app.post("/login", controller.login);
  app.post("/refresh", controller.refresh);
  app.post("/logout", controller.logout);
}
