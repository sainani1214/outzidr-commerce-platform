import { FastifyRequest, FastifyReply } from 'fastify';
import { orderService } from './order.service';
import { CreateOrderDTO, UpdateOrderStatusDTO, OrderQuery } from './order.types';
import { Validators } from '../../utils/validators';

export async function createOrder(
  request: FastifyRequest<{ Body: CreateOrderDTO }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;
  const data = request.body;

  Validators.required(data.shippingAddress, 'shippingAddress');
  Validators.required(data.shippingAddress.name, 'shippingAddress.name');
  Validators.required(data.shippingAddress.addressLine1, 'shippingAddress.addressLine1');
  Validators.required(data.shippingAddress.city, 'shippingAddress.city');
  Validators.required(data.shippingAddress.state, 'shippingAddress.state');
  Validators.required(data.shippingAddress.postalCode, 'shippingAddress.postalCode');
  Validators.required(data.shippingAddress.country, 'shippingAddress.country');
  Validators.required(data.shippingAddress.phone, 'shippingAddress.phone');

  const order = await orderService.createOrder(tenantId, userId, data);

  return reply.code(201).send({
    success: true,
    data: order,
  });
}

export async function getOrders(
  request: FastifyRequest<{ Querystring: OrderQuery }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;
  const query = request.query;

  const result = await orderService.getOrders(tenantId, userId, query);

  return reply.send({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
}

export async function getOrderById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const userId = request.user!.userId;
  const { id } = request.params;

  const order = await orderService.getOrderById(tenantId, userId, id);

  return reply.send({
    success: true,
    data: order,
  });
}

export async function updateOrderStatus(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateOrderStatusDTO;
  }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const { id } = request.params;
  const data = request.body;

  Validators.required(data.status, 'status');

  const order = await orderService.updateOrderStatus(tenantId, id, data);

  return reply.send({
    success: true,
    data: order,
  });
}
