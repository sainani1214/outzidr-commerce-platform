import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from './user.model';

export async function getCurrentUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user!.userId;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return reply.code(404).send({
      success: false,
      error: 'User not found',
    });
  }

  const userData = user.toUserObject();
  
  return reply.send({
    success: true,
    id: userData.id,
    email: userData.email,
    name: userData.name,
    tenantId: userData.tenantId,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
  });
}
