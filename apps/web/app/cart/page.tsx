import { redirect } from 'next/navigation';
import { isAuthenticated } from '../_actions/auth';
import { fetchCart } from '@/lib/server-api';
import CartContent from './CartContent';

// Disable caching for this page to always show fresh cart data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CartPage() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  // Fetch cart data on the server 
  const cartResponse = await fetchCart();

  return <CartContent initialCart={cartResponse.data} initialError={cartResponse.error} />;
}
