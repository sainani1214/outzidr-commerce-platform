import { FastifyInstance } from 'fastify';
import * as controller from './product.controller';

export async function productRoutes(app: FastifyInstance) {
  app.post('/', controller.createProduct);
  app.get('/', controller.getProducts);
  app.get('/:id', controller.getProductById);
  app.get('/sku/:sku', controller.getProductBySku);
  app.put('/:id', controller.updateProduct);
  app.patch('/:id/inventory', controller.updateInventory);
  app.delete('/:id', controller.deleteProduct);
}
