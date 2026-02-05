/**
 * Product service - Business logic layer
 */
import { ProductModel, IProductDocument } from './product.model';
import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductQuery,
  PaginatedProducts,
  InventoryUpdateDTO,
} from './product.types';

export class ProductService {
  /**
   * Create a new product
   */
  async createProduct(
    tenantId: string,
    data: CreateProductDTO
  ): Promise<Product> {
    // Check if SKU already exists for this tenant
    const existingProduct = await ProductModel.findOne({
      sku: data.sku,
      tenantId,
    });

    if (existingProduct) {
      throw new Error(`Product with SKU '${data.sku}' already exists`);
    }

    const product = new ProductModel({
      ...data,
      tenantId,
    });

    await product.save();
    return product.toProductObject();
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(
    tenantId: string,
    query: ProductQuery
  ): Promise<PaginatedProducts> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter
    const filter: any = { tenantId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [products, totalItems] = await Promise.all([
      ProductModel.find(filter).sort(sort).skip(skip).limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      products: products.map((p) => p.toProductObject()),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(tenantId: string, productId: string): Promise<Product> {
    const product = await ProductModel.findOne({
      _id: productId,
      tenantId,
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product.toProductObject();
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(tenantId: string, sku: string): Promise<Product> {
    const product = await ProductModel.findOne({
      sku,
      tenantId,
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product.toProductObject();
  }

  /**
   * Update product
   */
  async updateProduct(
    tenantId: string,
    productId: string,
    data: UpdateProductDTO
  ): Promise<Product> {
    const product = await ProductModel.findOne({
      _id: productId,
      tenantId,
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Validate inventory cannot go below zero
    if (data.inventory !== undefined && data.inventory < 0) {
      throw new Error('Inventory cannot be negative');
    }

    Object.assign(product, data);
    await product.save();

    return product.toProductObject();
  }

  /**
   * Update product inventory
   */
  async updateInventory(
    tenantId: string,
    productId: string,
    update: InventoryUpdateDTO
  ): Promise<Product> {
    const product = await ProductModel.findOne({
      _id: productId,
      tenantId,
    });

    if (!product) {
      throw new Error('Product not found');
    }

    let newInventory: number;

    switch (update.operation) {
      case 'add':
        newInventory = product.inventory + update.quantity;
        break;
      case 'subtract':
        newInventory = product.inventory - update.quantity;
        break;
      case 'set':
        newInventory = update.quantity;
        break;
      default:
        throw new Error('Invalid operation');
    }

    // Ensure inventory cannot go below zero
    if (newInventory < 0) {
      throw new Error(
        `Insufficient inventory. Available: ${product.inventory}, Requested: ${update.quantity}`
      );
    }

    product.inventory = newInventory;
    await product.save();

    return product.toProductObject();
  }

  /**
   * Delete product
   */
  async deleteProduct(tenantId: string, productId: string): Promise<void> {
    const result = await ProductModel.deleteOne({
      _id: productId,
      tenantId,
    });

    if (result.deletedCount === 0) {
      throw new Error('Product not found');
    }
  }

  /**
   * Check if sufficient inventory is available
   */
  async checkInventory(
    tenantId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    const product = await ProductModel.findOne({
      _id: productId,
      tenantId,
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product.inventory >= quantity;
  }
}

export const productService = new ProductService();
