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
import { CartModel } from '../cart/cart.model';
import { ProductModel } from '../products/product.model';
import { CartStatus } from '../cart/cart.types';
import mongoose from 'mongoose';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class OrderService {
  private async generateOrderNumber(tenantId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await OrderModel.countDocuments({ tenantId });
    const orderNum = (count + 1).toString().padStart(6, '0');
    return `ORD-${year}${month}-${orderNum}`;
  }

  async createOrder(
    tenantId: string,
    userId: string,
    data: CreateOrderDTO
  ): Promise<Order> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cart = await CartModel.findOne({
        tenantId,
        userId,
        status: CartStatus.ACTIVE,
      }).session(session);

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty or already checked out');
      }

      // Validate products and ensure we have complete snapshots
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

        // Ensure cart item has complete product snapshot (for legacy carts)
        if (!item.description || !item.imageUrl) {
          item.description = product.description;
          item.imageUrl = product.imageUrl;
          item.category = product.category;
        }
      }

      const orderNumber = await this.generateOrderNumber(tenantId);

      // Create order with complete product snapshots from cart
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
