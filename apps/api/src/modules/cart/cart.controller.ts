import { FastifyRequest, FastifyReply } from 'fastify';
import { cartService } from './cart.service';
import { AddToCartDTO, UpdateCartItemDTO } from './cart.types';
import { Validators } from '../../utils/validators';
import { BadRequestError } from '../../utils/errors';

export async function getCart(request: FastifyRequest, reply: FastifyReply) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;

  const cart = await cartService.getCart(tenantId, userId);

  return reply.send({
    success: true,
    data: cart,
  });
}

export async function addToCart(
  request: FastifyRequest<{ Body: AddToCartDTO }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;
  const data = request.body;

  Validators.required(data.productId, 'productId');
  
  if (!data.quantity || data.quantity <= 0) {
    throw new BadRequestError('Quantity must be greater than 0');
  }

  const cart = await cartService.addItem(tenantId, userId, data);

  return reply.send({
    success: true,
    data: cart,
  });
}

export async function updateCartItem(
  request: FastifyRequest<{
    Params: { productId: string };
    Body: UpdateCartItemDTO;
  }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;
  const { productId } = request.params;
  const data = request.body;

  if (!data.quantity || data.quantity <= 0) {
    throw new BadRequestError('Quantity must be greater than 0');
  }

  const cart = await cartService.updateItemQuantity(tenantId, userId, productId, data);

  return reply.send({
    success: true,
    data: cart,
  });
}

export async function removeFromCart(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;
  const { productId } = request.params;

  const cart = await cartService.removeItem(tenantId, userId, productId);

  return reply.send({
    success: true,
    data: cart,
  });
}

export async function clearCart(request: FastifyRequest, reply: FastifyReply) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;

  await cartService.clearCart(tenantId, userId);

  return reply.code(204).send();
}
