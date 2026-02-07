import { redirect } from 'next/navigation';
import { isAuthenticated } from '../_actions/auth';
import { fetchOrders } from '@/lib/server-api';
import OrdersContent from './OrdersContent';

export default async function OrdersPage() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  // Fetch orders on the server
  const ordersResponse = await fetchOrders();

  return <OrdersContent initialOrders={ordersResponse.data} initialError={ordersResponse.error} />;
}