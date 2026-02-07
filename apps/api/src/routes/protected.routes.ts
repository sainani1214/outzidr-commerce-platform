import { FastifyInstance } from 'fastify';
import { productRoutes } from '../modules/products/product.routes';
import { userRoutes } from '../modules/users/user.routes';
import cartRoutes from '../modules/cart/cart.routes';
import orderRoutes from '../modules/orders/order.routes';
import { CommonSchemas } from '../schemas';

export async function protectedRoutes(app: FastifyInstance) {
  // Register shared schema for tenant header
  app.addSchema(CommonSchemas.tenantHeaderSchema);

  // Global hooks for all protected routes
  app.addHook('preHandler', app.requireAuth);

  await app.register(productRoutes, { prefix: '/products' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(cartRoutes, { prefix: '/cart' });
  await app.register(orderRoutes, { prefix: '/orders' });
}

