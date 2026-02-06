import { FastifyRequest, FastifyReply } from 'fastify';
import { productService } from './product.service';
import { CreateProductDTO, UpdateProductDTO, ProductQuery, InventoryUpdateDTO } from './product.types';
import { Validators } from '../../utils/validators';
import { BadRequestError } from '../../utils/errors';

export async function createProduct(
  request: FastifyRequest<{ Body: CreateProductDTO }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const data = request.body;

  Validators.required(data.sku, 'sku');
  Validators.required(data.name, 'name');
  Validators.required(data.description, 'description');
  
  if (data.price === undefined || data.price < 0) {
    throw new BadRequestError('Valid price is required');
  }
  
  if (data.inventory === undefined || data.inventory < 0) {
    throw new BadRequestError('Valid inventory is required');
  }

  const product = await productService.createProduct(tenantId, data);

  return reply.code(201).send({
    success: true,
    data: product,
  });
}

export async function getProducts(
  request: FastifyRequest<{ Querystring: ProductQuery }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const query = request.query;

  const result = await productService.getProducts(tenantId, query);

  return reply.send({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
}

export async function getProductById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const { id } = request.params;

  const product = await productService.getProductById(tenantId, id);

  return reply.send({
    success: true,
    data: product,
  });
}

export async function getProductBySku(
  request: FastifyRequest<{ Params: { sku: string } }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const { sku } = request.params;

  const product = await productService.getProductBySku(tenantId, sku);

  return reply.send({
    success: true,
    data: product,
  });
}

export async function updateProduct(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductDTO }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const { id } = request.params;
  const data = request.body;

  if (data.price !== undefined && data.price < 0) {
    throw new BadRequestError('Price cannot be negative');
  }
  
  if (data.inventory !== undefined && data.inventory < 0) {
    throw new BadRequestError('Inventory cannot be negative');
  }

  const product = await productService.updateProduct(tenantId, id, data);

  return reply.send({
    success: true,
    data: product,
  });
}

export async function updateInventory(
  request: FastifyRequest<{ Params: { id: string }; Body: InventoryUpdateDTO }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const { id } = request.params;
  const data = request.body;

  if (!data.operation || !['add', 'subtract', 'set'].includes(data.operation)) {
    throw new BadRequestError('Valid operation is required (add, subtract, set)');
  }
  
  if (data.quantity === undefined || data.quantity < 0) {
    throw new BadRequestError('Valid quantity is required');
  }

  const product = await productService.updateInventory(tenantId, id, data);

  return reply.send({
    success: true,
    data: product,
  });
}

export async function deleteProduct(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const tenantId = request.tenantId!;
  const { id } = request.params;

  await productService.deleteProduct(tenantId, id);

  return reply.code(204).send();
}
