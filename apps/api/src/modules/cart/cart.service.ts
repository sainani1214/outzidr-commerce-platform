import { CartModel, ICartDocument } from './cart.model';
import { Cart, AddToCartDTO, UpdateCartItemDTO, CartSummary, CartStatus } from './cart.types';
import { productService } from '../products/product.service';
import { pricingService } from '../pricing/pricing.service';

export class CartService {
  private calculateCartTotals(cart: ICartDocument): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.basePrice, 0);
    cart.totalDiscount = cart.items.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0);
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  async getCart(tenantId: string, userId: string): Promise<Cart> {
    let cart = await CartModel.findOne({ tenantId, userId, status: CartStatus.ACTIVE });

    if (!cart) {
      cart = new CartModel({
        tenantId,
        userId,
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        status: CartStatus.ACTIVE,
      });
      await cart.save();
    }

    return cart.toCartObject();
  }

  async addItem(tenantId: string, userId: string, data: AddToCartDTO): Promise<Cart> {
    const product = await productService.getProductById(tenantId, data.productId);

    if (!product.isActive) {
      throw new Error('Product is not available');
    }

    if (product.inventory < data.quantity) {
      throw new Error(`Only ${product.inventory} items available in stock`);
    }

    let cart = await CartModel.findOne({ tenantId, userId });

    if (!cart) {
      cart = new CartModel({ tenantId, userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === data.productId
    );

    const priceResult = await pricingService.calculatePrice(tenantId, {
      productId: data.productId,
      quantity: data.quantity,
      basePrice: product.price,
      inventory: product.inventory,
    });

    if (existingItemIndex > -1) {
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + data.quantity;

      if (product.inventory < newQuantity) {
        throw new Error(`Only ${product.inventory} items available in stock`);
      }

      const updatedPriceResult = await pricingService.calculatePrice(tenantId, {
        productId: data.productId,
        quantity: newQuantity,
        basePrice: product.price,
        inventory: product.inventory,
      });

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].finalPrice = updatedPriceResult.finalPrice;
      cart.items[existingItemIndex].discountAmount = updatedPriceResult.discountAmount;
      cart.items[existingItemIndex].appliedRules = updatedPriceResult.appliedRules.map(r => r.ruleName);
      cart.items[existingItemIndex].subtotal = updatedPriceResult.finalPrice * newQuantity;
    } else {
      cart.items.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: data.quantity,
        basePrice: product.price,
        finalPrice: priceResult.finalPrice,
        discountAmount: priceResult.discountAmount,
        appliedRules: priceResult.appliedRules.map(r => r.ruleName),
        subtotal: priceResult.finalPrice * data.quantity,
      });
    }

    this.calculateCartTotals(cart);
    await cart.save();

    return cart.toCartObject();
  }

  async updateItemQuantity(
    tenantId: string,
    userId: string,
    productId: string,
    data: UpdateCartItemDTO
  ): Promise<Cart> {
    const cart = await CartModel.findOne({ tenantId, userId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const product = await productService.getProductById(tenantId, productId);

    if (product.inventory < data.quantity) {
      throw new Error(`Only ${product.inventory} items available in stock`);
    }

    const priceResult = await pricingService.calculatePrice(tenantId, {
      productId,
      quantity: data.quantity,
      basePrice: product.price,
      inventory: product.inventory,
    });

    cart.items[itemIndex].quantity = data.quantity;
    cart.items[itemIndex].finalPrice = priceResult.finalPrice;
    cart.items[itemIndex].discountAmount = priceResult.discountAmount;
    cart.items[itemIndex].appliedRules = priceResult.appliedRules.map(r => r.ruleName);
    cart.items[itemIndex].subtotal = priceResult.finalPrice * data.quantity;

    this.calculateCartTotals(cart);
    await cart.save();

    return cart.toCartObject();
  }

  async removeItem(tenantId: string, userId: string, productId: string): Promise<Cart> {
    const cart = await CartModel.findOne({ tenantId, userId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);

    this.calculateCartTotals(cart);
    await cart.save();

    return cart.toCartObject();
  }

  async clearCart(tenantId: string, userId: string): Promise<void> {
    const cart = await CartModel.findOne({ tenantId, userId });

    if (cart) {
      cart.items = [];
      cart.totalItems = 0;
      cart.subtotal = 0;
      cart.totalDiscount = 0;
      cart.total = 0;
      await cart.save();
    }
  }

  async getCartSummary(tenantId: string, userId: string): Promise<CartSummary> {
    const cart = await this.getCart(tenantId, userId);

    return {
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
      totalDiscount: cart.totalDiscount,
      total: cart.total,
    };
  }
}

export const cartService = new CartService();
