import { FastifyPluginAsync } from 'fastify';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from './cart.controller';
import { CartSchemas } from '../../schemas';

const cartRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { schema: CartSchemas.getCartSchema }, getCart);
  app.post('/items', { schema: CartSchemas.addToCartSchema }, addToCart);
  app.put('/items/:productId', { schema: CartSchemas.updateCartItemSchema }, updateCartItem);
  app.delete('/items/:productId', { schema: CartSchemas.removeFromCartSchema }, removeFromCart);
  app.delete('/', { schema: CartSchemas.clearCartSchema }, clearCart);
};

export default cartRoutes;
