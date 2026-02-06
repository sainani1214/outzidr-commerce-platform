import { FastifyPluginAsync } from 'fastify';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from './cart.controller';

const cartRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', getCart);
  app.post('/items', addToCart);
  app.put('/items/:productId', updateCartItem);
  app.delete('/items/:productId', removeFromCart);
  app.delete('/', clearCart);
};

export default cartRoutes;
