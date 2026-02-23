import { redirect } from 'next/navigation';
import { isAuthenticated } from '../_actions/auth';
import { fetchOrders } from '@/lib/server-api';
import OrdersContent from './OrdersContent';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;

  // Fetch orders on the server with pagination
  const ordersResponse = await fetchOrders({ page, limit: 10 });

  return (
    <OrdersContent 
      initialOrders={ordersResponse.data} 
      initialError={ordersResponse.error}
      pagination={ordersResponse.pagination}
      currentPage={page}
    />
  );
}