import { redirect } from 'next/navigation';
import { isAuthenticated } from '../_actions/auth';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  return <OrdersClient />;
}