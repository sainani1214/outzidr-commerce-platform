'use server';

import { fetchOrders, fetchOrder, createOrder as apiCreateOrder } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';

export async function getOrders(page?: number, limit?: number) {
  const response = await fetchOrders({ page, limit });
  return response;
}

export async function getOrder(id: string) {
  const response = await fetchOrder(id);
  return response;
}

export async function createOrder(shippingAddress: any) {
  const response = await apiCreateOrder(shippingAddress);
  revalidatePath('/orders');
  revalidatePath('/cart');
  return response;
}
