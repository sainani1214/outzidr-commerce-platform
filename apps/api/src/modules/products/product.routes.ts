import { FastifyInstance } from 'fastify';
import * as controller from './product.controller';
import { ProductSchemas } from '../../schemas';

export async function productRoutes(app: FastifyInstance) {
  app.post('/', { schema: ProductSchemas.createProductSchema }, controller.createProduct);
  app.get('/', { schema: ProductSchemas.getProductsSchema }, controller.getProducts);
  app.get('/:id', { schema: ProductSchemas.getProductByIdSchema }, controller.getProductById);
  app.get('/sku/:sku', { schema: ProductSchemas.getProductBySkuSchema }, controller.getProductBySku);
  app.put('/:id', { schema: ProductSchemas.updateProductSchema }, controller.updateProduct);
  app.patch('/:id/inventory', { schema: ProductSchemas.updateInventorySchema }, controller.updateInventory);
  app.delete('/:id', { schema: ProductSchemas.deleteProductSchema }, controller.deleteProduct);
}
