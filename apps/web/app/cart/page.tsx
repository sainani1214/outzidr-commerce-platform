import { redirect } from 'next/navigation';
import { isAuthenticated } from '../_actions/auth';
import CartClient from './CartClient';

export default async function CartPage() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  return <CartClient />;
}
