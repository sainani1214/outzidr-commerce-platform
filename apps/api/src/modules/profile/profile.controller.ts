import { FastifyRequest, FastifyReply } from "fastify";

export class ProfileController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user!;

    return reply.send({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        tenantId: user.tenantId,
      },
    });
  }

  async getDashboard(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: `Welcome, ${request.user!.email}`,
    });
  }
}

export const profileController = new ProfileController();
