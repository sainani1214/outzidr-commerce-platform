import { OrderModel } from './order.model';
import {
  Order,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
  OrderQuery,
  PaginatedOrders,
  OrderStatus,
} from './order.types';
import { cartService } from '../cart/cart.service';
import { productService } from '../products/product.service';

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
    const cart = await cartService.getCart(tenantId, userId);

    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    for (const item of cart.items) {
      const product = await productService.getProductById(tenantId, item.productId);

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is no longer available`);
      }

      if (product.inventory < item.quantity) {
        throw new Error(
          `Insufficient inventory for ${product.name}. Only ${product.inventory} available`
        );
      }
    }

    const orderNumber = await this.generateOrderNumber(tenantId);

    const order = new OrderModel({
      tenantId,
      userId,
      orderNumber,
      items: cart.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        basePrice: item.basePrice,
        finalPrice: item.finalPrice,
        discountAmount: item.discountAmount,
        appliedRules: item.appliedRules,
        subtotal: item.subtotal,
      })),
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
      totalDiscount: cart.totalDiscount,
      total: cart.total,
      status: OrderStatus.PENDING,
      shippingAddress: data.shippingAddress,
    });

    await order.save();

    for (const item of cart.items) {
      await productService.updateInventory(tenantId, item.productId, {
        quantity: item.quantity,
        operation: 'subtract',
      });
    }

    await cartService.clearCart(tenantId, userId);

    return order.toOrderObject();
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
      throw new Error('Order not found');
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
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error('Cannot update status of cancelled order');
    }

    if (order.status === OrderStatus.DELIVERED && data.status !== OrderStatus.CANCELLED) {
      throw new Error('Cannot update status of delivered order');
    }

    if (data.status === OrderStatus.CANCELLED && order.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be cancelled');
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
