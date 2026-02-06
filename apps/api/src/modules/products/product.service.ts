import { ProductModel, IProductDocument } from './product.model';
import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductQuery,
  PaginatedProducts,
  InventoryUpdateDTO,
} from './product.types';
import { pricingService } from '../pricing/pricing.service';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/errors';

export class ProductService {
  private async applyDynamicPricing(
    tenantId: string,
    product: Product,
    quantity: number = 1
  ): Promise<Product> {
    try {
      const priceResult = await pricingService.calculatePrice(tenantId, {
        productId: product.id,
        quantity,
        basePrice: product.price,
        inventory: product.inventory,
      });

      return {
        ...product,
        finalPrice: priceResult.finalPrice,
        discountAmount: priceResult.discountAmount,
        appliedRules: priceResult.appliedRules.map((rule) => rule.ruleName),
      };
    } catch (error) {
      return {
        ...product,
        finalPrice: product.price,
        discountAmount: 0,
        appliedRules: [],
      };
    }
  }

  async createProduct(
    tenantId: string,
    data: CreateProductDTO
  ): Promise<Product> {
    const existingProduct = await ProductModel.findOne({
      sku: data.sku,
      tenantId,
    });

    if (existingProduct) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
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

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const [products, totalItems] = await Promise.all([
      ProductModel.find(filter).sort(sort).skip(skip).limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const productsWithPricing = await Promise.all(
      products.map((p) => this.applyDynamicPricing(tenantId, p.toProductObject(), 1))
    );

    return {
      products: productsWithPricing,
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

  async getProductById(tenantId: string, productId: string): Promise<Product> {
    const product = await ProductModel.findOne({
      _id: productId,
      tenantId,
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return this.applyDynamicPricing(tenantId, product.toProductObject(), 1);
  }

  async getProductBySku(tenantId: string, sku: string): Promise<Product> {
    const product = await ProductModel.findOne({
      sku,
      tenantId,
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return this.applyDynamicPricing(tenantId, product.toProductObject(), 1);
  }

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
      throw new NotFoundError('Product not found');
    }

    // Validate inventory cannot go below zero
    if (data.inventory !== undefined && data.inventory < 0) {
      throw new BadRequestError('Inventory cannot be negative');
    }

    Object.assign(product, data);
    await product.save();

    return product.toProductObject();
  }

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
      throw new NotFoundError('Product not found');
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
        throw new BadRequestError('Invalid operation');
    }

    if (newInventory < 0) {
      throw new BadRequestError(
        `Insufficient inventory. Available: ${product.inventory}, Requested: ${update.quantity}`
      );
    }

    product.inventory = newInventory;
    await product.save();

    return product.toProductObject();
  }

  async deleteProduct(tenantId: string, productId: string): Promise<void> {
    const result = await ProductModel.deleteOne({
      _id: productId,
      tenantId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Product not found');
    }
  }

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
      throw new NotFoundError('Product not found');
    }

    return product.inventory >= quantity;
  }
}

export const productService = new ProductService();
