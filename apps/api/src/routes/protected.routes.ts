import { FastifyInstance } from 'fastify';
import { productRoutes } from '../modules/products/product.routes';
import { userRoutes } from '../modules/users/user.routes';
import cartRoutes from '../modules/cart/cart.routes';

export async function protectedRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.requireAuth);

  await app.register(productRoutes, { prefix: '/products' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(cartRoutes, { prefix: '/cart' });
}
