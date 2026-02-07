import { redirect } from 'next/navigation';
import { fetchProduct } from '@/lib/server-api';
import { isAuthenticated } from '@/app/_actions/auth';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  const { id } = await params;
  const response = await fetchProduct(id);

  if (response.error || !response.data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 backdrop-blur-sm">
          <p className="text-red-400">{response.error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  return <ProductDetailClient product={response.data} />;
}
