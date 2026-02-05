import { FastifyRequest, FastifyReply } from 'fastify';

export async function getCurrentUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.send({
    success: true,
    data: {
      userId: request.user!.userId,
      email: request.user!.email,
      tenantId: request.user!.tenantId,
    },
  });
}
