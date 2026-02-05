import { FastifyRequest, FastifyReply } from 'fastify';
import { productService } from './product.service';
import { CreateProductDTO, UpdateProductDTO, ProductQuery, InventoryUpdateDTO } from './product.types';
import { Validators } from '../../utils/validators';

export async function createProduct(
  request: FastifyRequest<{ Body: CreateProductDTO }>,
  reply: FastifyReply
) {
  try {
    const tenantId = request.tenantId!;
    const data = request.body;

    Validators.required(data.sku, 'sku');
    Validators.required(data.name, 'name');
    Validators.required(data.description, 'description');
    
    if (data.price === undefined || data.price < 0) {
      throw new Error('Valid price is required');
    }
    
    if (data.inventory === undefined || data.inventory < 0) {
      throw new Error('Valid inventory is required');
    }

    const product = await productService.createProduct(tenantId, data);

    return reply.code(201).send({
      success: true,
      data: product,
    });
  } catch (error) {
    request.log.error(error);
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return reply.code(400).send({
      success: false,
      error: message,
    });
  }
}

export async function getProducts(
  request: FastifyRequest<{ Querystring: ProductQuery }>,
  reply: FastifyReply
) {
  try {
    const tenantId = request.tenantId!;
    const query = request.query;

    const result = await productService.getProducts(tenantId, query);

    return reply.send({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to fetch products',
    });
  }
}

export async function getProductById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const tenantId = request.tenantId!;
    const { id } = request.params;

    const product = await productService.getProductById(tenantId, id);

    return reply.send({
      success: true,
      data: product,
    });
  } catch (error) {
    request.log.error(error);
    const message = error instanceof Error ? error.message : 'Product not found';
    return reply.code(404).send({
      success: false,
      error: message,
    });
  }
}

export async function getProductBySku(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
) {
  try {
    const tenantId = request.tenantId!;
    const { sku } = request.params;

    const product = await productService.getProductBySku(tenantId, sku);

    return reply.send({
      success: true,
      data: product,
    });
  } catch (error) {
    request.log.error(error);
    const message = error instanceof Error ? error.message : 'Product not found';
    return reply.code(404).send({
      success: false,
      error: message,
    });
  }
}

export async function updateProduct(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductDTO }>,
  reply: FastifyReply
) {
  try {
    const tenantId = request.tenantId!;
    const { id } = request.params;
    const data = request.body;

    if (data.price !== undefined && data.price < 0) {
      throw new Error('Price cannot be negative');
    }
    
    if (data.inventory !== undefined && data.inventory < 0) {
      throw new Error('Inventory cannot be negative');
    }

    const product = await productService.updateProduct(tenantId, id, data);

    return reply.send({
      success: true,
      data: product,
    });
  } catch (error) {
    request.log.error(error);
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return reply.code(400).send({
      success: false,
      error: message,
    });
  }
}

export async function updateInventory(
  request: FastifyRequest<{ Params: { id: string }; Body: InventoryUpdateDTO }>,
  reply: FastifyReply
) {
  try {
    const tenantId = request.tenantId!;
    const { id } = request.params;
    const data = request.body;

    if (!data.operation || !['add', 'subtract', 'set'].includes(data.operation)) {
      throw new Error('Valid operation is required (add, subtract, set)');
    }
    
    if (data.quantity === undefined || data.quantity < 0) {
      throw new Error('Valid quantity is required');
    }

    const product = await productService.updateInventory(tenantId, id, data);

    return reply.send({
      success: true,
      data: product,
    });
  } catch (error) {
    request.log.error(error);
    const message = error instanceof Error ? error.message : 'Failed to update inventory';
    return reply.code(400).send({
      success: false,
      error: message,
    });
  }
}

export async function deleteProduct(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const tenantId = request.tenantId!;
    const { id } = request.params;

    await productService.deleteProduct(tenantId, id);

    return reply.code(204).send();
  } catch (error) {
    request.log.error(error);
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return reply.code(404).send({
      success: false,
      error: message,
    });
  }
}
