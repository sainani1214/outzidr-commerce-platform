import { FastifyPluginAsync } from 'fastify';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from './order.controller';

const orderRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', createOrder);
  app.get('/', getOrders);
  app.get('/:id', getOrderById);
  app.put('/:id/status', updateOrderStatus);
};

export default orderRoutes;
