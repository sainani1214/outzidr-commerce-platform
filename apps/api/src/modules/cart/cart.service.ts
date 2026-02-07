import { CartModel, ICartDocument } from './cart.model';
import { Cart, AddToCartDTO, UpdateCartItemDTO, CartSummary, CartStatus } from './cart.types';
import { productService } from '../products/product.service';
import { pricingService } from '../pricing/pricing.service';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class CartService {
  private calculateCartTotals(cart: ICartDocument): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.basePrice, 0);
    cart.totalDiscount = cart.items.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0);
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  async getCart(tenantId: string, userId: string): Promise<Cart> {
    try {
      let cart = await CartModel.findOne({ tenantId, userId });

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
        
        try {
          await cart.save();
        } catch (saveError: any) {
          if (saveError.code === 11000) {
            cart = await CartModel.findOne({ tenantId, userId });
            if (!cart) {
              throw new Error('Failed to retrieve or create cart');
            }
          } else {
            throw saveError;
          }
        }
      } else if (cart.status !== CartStatus.ACTIVE) {
        cart.items = [];
        cart.totalItems = 0;
        cart.subtotal = 0;
        cart.totalDiscount = 0;
        cart.total = 0;
        cart.status = CartStatus.ACTIVE;
        await cart.save();
      }

      return cart.toCartObject();
    } catch (error: any) {
      console.error('Error in getCart:', error);
      throw error;
    }
  }

  async addItem(tenantId: string, userId: string, data: AddToCartDTO): Promise<Cart> {
    const product = await productService.getProductById(tenantId, data.productId);

    if (!product.isActive) {
      throw new BadRequestError('Product is not available');
    }

    if (product.inventory < data.quantity) {
      throw new BadRequestError(`Only ${product.inventory} items available in stock`);
    }

    let cart = await CartModel.findOne({ tenantId, userId });

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
    } else if (cart.status !== CartStatus.ACTIVE) {
      cart.status = CartStatus.ACTIVE;
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === data.productId.toString()
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
        throw new BadRequestError(`Only ${product.inventory} items available in stock`);
      }

      const updatedPriceResult = await pricingService.calculatePrice(tenantId, {
        productId: data.productId,
        quantity: newQuantity,
        basePrice: product.price,
        inventory: product.inventory,
      });

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].finalPrice = updatedPriceResult.finalPrice / newQuantity;
      cart.items[existingItemIndex].discountAmount = updatedPriceResult.discountAmount / newQuantity;
      cart.items[existingItemIndex].appliedRules = updatedPriceResult.appliedRules.map(r => r.ruleName);
      cart.items[existingItemIndex].subtotal = updatedPriceResult.finalPrice;
    } else {
      cart.items.push({
        productId: data.productId,
        sku: product.sku,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity: data.quantity,
        basePrice: product.price,
        finalPrice: priceResult.finalPrice / data.quantity,
        discountAmount: priceResult.discountAmount / data.quantity,
        appliedRules: priceResult.appliedRules.map(r => r.ruleName),
        subtotal: priceResult.finalPrice,
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
      throw new NotFoundError('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId.toString());

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    if (data.quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than 0');
    }

    const product = await productService.getProductById(tenantId, productId);

    if (product.inventory < data.quantity) {
      throw new BadRequestError(`Only ${product.inventory} items available in stock`);
    }

    const priceResult = await pricingService.calculatePrice(tenantId, {
      productId,
      quantity: data.quantity,
      basePrice: product.price,
      inventory: product.inventory,
    });

    cart.items[itemIndex].quantity = data.quantity;
    cart.items[itemIndex].finalPrice = priceResult.finalPrice / data.quantity;
    cart.items[itemIndex].discountAmount = priceResult.discountAmount / data.quantity;
    cart.items[itemIndex].appliedRules = priceResult.appliedRules.map(r => r.ruleName);
    cart.items[itemIndex].subtotal = priceResult.finalPrice;

    this.calculateCartTotals(cart);
    await cart.save();

    return cart.toCartObject();
  }

  async removeItem(tenantId: string, userId: string, productId: string): Promise<Cart> {
    const cart = await CartModel.findOne({ tenantId, userId });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId.toString());

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
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
