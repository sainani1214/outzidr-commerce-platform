import { FastifyInstance } from "fastify";
import { profileController } from "./profile.controller";

export async function profileRoutes(app: FastifyInstance) {
  app.get("/profile", {
    preHandler: app.requireAuth,
    handler: profileController.getProfile.bind(profileController),
  });

  app.get("/dashboard", {
    preHandler: app.requireAuth,
    handler: profileController.getDashboard.bind(profileController),
  });
}
