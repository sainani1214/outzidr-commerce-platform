'use server';

import { fetchCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';

export async function getCart() {
  const response = await fetchCart();
  return response;
}

export async function addToCart(productId: string, quantity: number) {
  const response = await apiAddToCart(productId, quantity);
  revalidatePath('/cart');
  revalidatePath('/products');
  return response;
}

export async function updateCartQuantity(productId: string, quantity: number) {
  const response = await apiUpdateCartItem(productId, quantity);
  revalidatePath('/cart');
  return response;
}

export async function removeCartItem(productId: string) {
  const response = await apiRemoveFromCart(productId);
  revalidatePath('/cart');
  return response;
}
