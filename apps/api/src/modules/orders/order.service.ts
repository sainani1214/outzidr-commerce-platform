import { OrderModel } from './order.model';
import {
  Order,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
  OrderQuery,
  PaginatedOrders,
  OrderStatus,
} from './order.types';
import { productService } from '../products/product.service';
import { pricingService } from '../pricing/pricing.service';
import { CartModel, ICartDocument } from '../cart/cart.model';
import { ProductModel } from '../products/product.model';
import { CartStatus } from '../cart/cart.types';
import mongoose from 'mongoose';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';

export class OrderService {
  private async generateOrderNumber(tenantId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await OrderModel.countDocuments({ tenantId });
    const orderNum = (count + 1).toString().padStart(6, '0');
    return `ORD-${year}${month}-${orderNum}`;
  }

 

  /**
   * Revalidates cart pricing before checkout to prevent orders with stale prices
   * Compares stored cart prices with current product prices and pricing rules
   * Throws ConflictError if prices have changed and updates the cart
   */
  private async revalidateCartPricing(
    tenantId: string,
    cart: ICartDocument,
    session: mongoose.mongo.ClientSession
  ): Promise<void> {
    let priceChanged = false;

    for (const item of cart.items) {
      // Fetch latest product data
      const product = await ProductModel.findOne({
        _id: item.productId,
        tenantId,
      }).session(session);

      if (!product || !product.isActive) {
        throw new BadRequestError(`Product ${item.name} is no longer available`);
      }

      // Re-calculate pricing with current product data and quantity
      const priceResult = await pricingService.calculatePrice(tenantId, {
        productId: item.productId,
        quantity: item.quantity,
        basePrice: product.price,
        inventory: product.inventory,
      });

      // Calculate per-item prices for comparison
      // priceResult.finalPrice is total for all items, so divide by quantity
      const calculatedFinalPricePerItem = priceResult.finalPrice / item.quantity;
      const calculatedDiscountPerItem = priceResult.discountAmount / item.quantity;
      const calculatedSubtotal = priceResult.finalPrice;

      // Compare recalculated prices with cart's stored prices
      // Use toFixed to avoid floating point precision issues
      const storedFinalPrice = Number(item.finalPrice.toFixed(2));
      const newFinalPrice = Number(calculatedFinalPricePerItem.toFixed(2));
      const storedBasePrice = Number(item.basePrice.toFixed(2));
      const newBasePrice = Number(product.price.toFixed(2));

      // Check if either base price or final price has changed
      if (storedFinalPrice !== newFinalPrice || storedBasePrice !== newBasePrice) {
        priceChanged = true;

        // Update cart item with latest pricing
        item.basePrice = product.price;
        item.finalPrice = calculatedFinalPricePerItem;
        item.discountAmount = calculatedDiscountPerItem;
        item.subtotal = calculatedSubtotal;
        item.appliedRules = priceResult.appliedRules.map((rule) => rule.ruleName);
      }

      // Also update product metadata if changed
      if (
        item.description !== product.description ||
        item.imageUrl !== product.imageUrl ||
        item.category !== product.category
      ) {
        item.description = product.description;
        item.imageUrl = product.imageUrl;
        item.category = product.category;
      }
    }

    // If any price changed, update cart and abort checkout
    if (priceChanged) {
      // Recalculate cart totals
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.basePrice, 0);
      cart.totalDiscount = cart.items.reduce(
        (sum, item) => sum + item.discountAmount * item.quantity,
        0
      );
      cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

      // Explicitly mark nested items array as modified
      cart.markModified('items');
      
      // Save updated cart within transaction
      await cart.save({ session });

      // Abort checkout with 409 Conflict error
      throw new ConflictError(
        'Pricing has changed. Please review your cart before checkout.'
      );
    }
  }

  /**
   * Revalidates cart pricing WITHOUT transaction
   * This ensures cart updates persist even when order creation is aborted
   */
  private async revalidateCartPricingWithoutTransaction(
    tenantId: string,
    cart: ICartDocument
  ): Promise<void> {
    let priceChanged = false;

    for (const item of cart.items) {
      // Fetch latest product data
      const product = await ProductModel.findOne({
        _id: item.productId,
        tenantId,
      });

      if (!product || !product.isActive) {
        throw new BadRequestError(`Product ${item.name} is no longer available`);
      }

      // Re-calculate pricing with current product data and quantity
      const priceResult = await pricingService.calculatePrice(tenantId, {
        productId: item.productId,
        quantity: item.quantity,
        basePrice: product.price,
        inventory: product.inventory,
      });

      // Calculate per-item prices for comparison
      const calculatedFinalPricePerItem = priceResult.finalPrice / item.quantity;
      const calculatedDiscountPerItem = priceResult.discountAmount / item.quantity;
      const calculatedSubtotal = priceResult.finalPrice;

      // Compare recalculated prices with cart's stored prices
      const storedFinalPrice = Number(item.finalPrice.toFixed(2));
      const newFinalPrice = Number(calculatedFinalPricePerItem.toFixed(2));
      const storedBasePrice = Number(item.basePrice.toFixed(2));
      const newBasePrice = Number(product.price.toFixed(2));

      // Check if either base price or final price has changed
      if (storedFinalPrice !== newFinalPrice || storedBasePrice !== newBasePrice) {
        priceChanged = true;

        // Update cart item with latest pricing
        item.basePrice = product.price;
        item.finalPrice = calculatedFinalPricePerItem;
        item.discountAmount = calculatedDiscountPerItem;
        item.subtotal = calculatedSubtotal;
        item.appliedRules = priceResult.appliedRules.map((rule) => rule.ruleName);
      }

      // Also update product metadata if changed
      if (
        item.description !== product.description ||
        item.imageUrl !== product.imageUrl ||
        item.category !== product.category
      ) {
        item.description = product.description;
        item.imageUrl = product.imageUrl;
        item.category = product.category;
      }
    }

    // If any price changed, update cart and abort checkout
    if (priceChanged) {
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.basePrice, 0);
      cart.totalDiscount = cart.items.reduce(
        (sum, item) => sum + item.discountAmount * item.quantity,
        0
      );
      cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

      cart.markModified('items');
      await cart.save();

      throw new ConflictError(
        'Pricing has changed. Please review your cart before checkout.'
      );
    }
  }

  async createOrder(
    tenantId: string,
    userId: string,
    data: CreateOrderDTO
  ): Promise<Order> {
    // First, check and update cart pricing outside of order transaction
    // This ensures cart updates persist even if order creation fails
    const cartForValidation = await CartModel.findOne({
      tenantId,
      userId,
      status: CartStatus.ACTIVE,
    });

    if (!cartForValidation || !cartForValidation.items || cartForValidation.items.length === 0) {
      throw new BadRequestError('Cart is empty or already checked out');
    }

    // Validate pricing and update cart if needed (without transaction)
    await this.revalidateCartPricingWithoutTransaction(tenantId, cartForValidation);

    // Now start transaction for order creation
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Re-fetch cart within transaction for order creation
      const cart = await CartModel.findOne({
        tenantId,
        userId,
        status: CartStatus.ACTIVE,
      }).session(session);

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty or already checked out');
      }

      // Validate inventory availability
      for (const item of cart.items) {
        const product = await ProductModel.findOne({
          _id: item.productId,
          tenantId,
        }).session(session);

        if (!product || !product.isActive) {
          throw new BadRequestError(`Product ${item.name} is no longer available`);
        }

        if (product.inventory < item.quantity) {
          throw new BadRequestError(
            `Insufficient inventory for ${item.name}. Only ${product.inventory} available`
          );
        }
      }

      const orderNumber = await this.generateOrderNumber(tenantId);

      // Create order with validated pricing from cart
      const order = new OrderModel({
        tenantId,
        userId,
        orderNumber,
        items: cart.items.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          category: item.category,
          quantity: item.quantity,
          basePrice: item.basePrice,
          finalPrice: item.finalPrice,
          discountAmount: item.discountAmount,
          subtotal: item.subtotal,
        })),
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        totalDiscount: cart.totalDiscount,
        total: cart.total,
        status: OrderStatus.PLACED,
        shippingAddress: data.shippingAddress,
      });

      await order.save({ session });

      for (const item of cart.items) {
        const updateResult = await ProductModel.updateOne(
          {
            _id: item.productId,
            tenantId,
            inventory: { $gte: item.quantity },
          },
          {
            $inc: { inventory: -item.quantity },
          }
        ).session(session);

        if (updateResult.matchedCount === 0) {
          throw new BadRequestError(
            `Failed to update inventory for ${item.name}. Insufficient stock or product not found.`
          );
        }
      }

      cart.status = CartStatus.CHECKED_OUT;
      await cart.save({ session });

      await session.commitTransaction();
      session.endSession();

      return order.toOrderObject();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getOrders(
    tenantId: string,
    userId: string,
    query: OrderQuery
  ): Promise<PaginatedOrders> {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = { tenantId, userId };

    if (status) {
      filter.status = status;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const [orders, totalItems] = await Promise.all([
      OrderModel.find(filter).sort(sort).skip(skip).limit(limit),
      OrderModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      orders: orders.map((o) => o.toOrderObject()),
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

  async getOrderById(tenantId: string, userId: string, orderId: string): Promise<Order> {
    const order = await OrderModel.findOne({
      _id: orderId,
      tenantId,
      userId,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order.toOrderObject();
  }

  async updateOrderStatus(
    tenantId: string,
    orderId: string,
    data: UpdateOrderStatusDTO
  ): Promise<Order> {
    const order = await OrderModel.findOne({
      _id: orderId,
      tenantId,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError('Cannot update status of cancelled order');
    }

    if (order.status === OrderStatus.DELIVERED && data.status !== OrderStatus.CANCELLED) {
      throw new BadRequestError('Cannot update status of delivered order');
    }

    if (data.status === OrderStatus.CANCELLED && order.status !== OrderStatus.PLACED) {
      throw new BadRequestError('Only placed orders can be cancelled');
    }

    if (data.status === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await productService.updateInventory(tenantId, item.productId, {
          quantity: item.quantity,
          operation: 'add',
        });
      }
    }

    order.status = data.status;
    await order.save();

    return order.toOrderObject();
  }
}

export const orderService = new OrderService();
