import { fetchProducts } from '@/lib/server-api';
import { colors } from '@/styles/colors';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { isAuthenticated } from '@/app/_actions/auth';
import { redirect } from 'next/navigation';


interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // Authentication check - will redirect if token is invalid
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category;

  // API call will automatically redirect if 401 on server-side
  const response = await fetchProducts({ page, limit: 12, category });

  if (response.error) {
    return (
      <main style={{ backgroundColor: colors.bg.primary }} className="min-h-screen text-white">
        <div className="px-8 pt-24 pb-16 max-w-7xl mx-auto">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-semibold mb-4" style={{ color: colors.text.primary }}>
              Error Loading Products
            </h1>
            <p className="mb-6" style={{ color: colors.text.secondary }}>
              {response.error}
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: colors.accent.primary,
                color: colors.text.primary,
              }}
            >
              Try Again
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const products = response.data || [];
  const pagination = response.pagination;

  return (
    <main style={{ backgroundColor: colors.bg.primary }} className="min-h-screen text-white">
      <section className="px-4 sm:px-8 pt-24 pb-16 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold" style={{ color: colors.text.primary }}>
          Products
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base" style={{ color: colors.text.secondary }}>
          Explore our curated selection with real-time inventory and dynamic pricing
        </p>
      </section>

      <section className="px-4 sm:px-8 pb-24 max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: colors.text.secondary }}>No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                {page > 1 && (
                  <Link
                    href={`/products?page=${page - 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: colors.bg.secondary,
                      color: colors.text.primary,
                      border: `1px solid ${colors.border.subtle}`,
                    }}
                  >
                    Previous
                  </Link>
                )}
                <span 
                  className="px-4 py-2 text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                {page < pagination.totalPages && (
                  <Link
                    href={`/products?page=${page + 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: colors.bg.secondary,
                      color: colors.text.primary,
                      border: `1px solid ${colors.border.subtle}`,
                    }}
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
