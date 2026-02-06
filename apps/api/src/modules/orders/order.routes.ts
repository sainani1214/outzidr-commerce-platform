import { FastifyPluginAsync } from 'fastify';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from './order.controller';
import { OrderSchemas } from '../../schemas';

const orderRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { schema: OrderSchemas.createOrderSchema }, createOrder);
  app.get('/', { schema: OrderSchemas.getOrdersSchema }, getOrders);
  app.get('/:id', { schema: OrderSchemas.getOrderByIdSchema }, getOrderById);
  app.put('/:id/status', { schema: OrderSchemas.updateOrderStatusSchema }, updateOrderStatus);
};

export default orderRoutes;
