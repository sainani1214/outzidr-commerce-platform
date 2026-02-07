import { fetchProducts } from '@/lib/server-api';
import { colors } from '@/styles/colors';
import Link from 'next/link';

interface PageProps {
  searchParams: { page?: string; category?: string };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const category = searchParams.category;

  const response = await fetchProducts({ page, limit: 12, category });

  if (response.error) {
    return (
      <main style={{ backgroundColor: colors.bg.primary }} className="min-h-screen text-white">
        <div className="px-8 pt-24 pb-16 max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
            Error Loading Products
          </h1>
          <p className="mt-4" style={{ color: colors.text.secondary }}>
            {response.error}
          </p>
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
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <div 
                    className="aspect-square flex items-center justify-center"
                    style={{ backgroundColor: colors.bg.surface }}
                  >
                    <svg
                      className="w-16 h-16 sm:w-20 sm:h-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ color: colors.text.muted }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 
                      className="font-medium text-base sm:text-lg mb-1 line-clamp-1"
                      style={{ color: colors.text.primary }}
                    >
                      {product.name}
                    </h3>
                    <p 
                      className="text-xs sm:text-sm line-clamp-2 mb-3"
                      style={{ color: colors.text.secondary }}
                    >
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xl sm:text-2xl font-semibold"
                        style={{ color: colors.accent.primary }}
                      >
                        ${product.price.toFixed(2)}
                      </span>
                      <span
                        className="text-xs sm:text-sm"
                        style={{
                          color: product.inventory > 0 ? '#10b981' : '#ef4444',
                        }}
                      >
                        {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </Link>
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
