import { colors } from '@/styles/colors';

export default function Loading() {
  return (
    <main style={{ backgroundColor: colors.bg.primary }} className="min-h-screen text-white">
      <section className="px-4 sm:px-8 pt-24 pb-16 max-w-7xl mx-auto">
        <div className="h-10 w-48 rounded-lg animate-pulse" style={{ backgroundColor: colors.bg.secondary }}></div>
        <div className="mt-3 h-6 w-96 rounded-lg animate-pulse" style={{ backgroundColor: colors.bg.secondary }}></div>
      </section>

      <section className="px-4 sm:px-8 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 animate-pulse"
              style={{ 
                backgroundColor: colors.bg.secondary,
                border: `1px solid ${colors.border.subtle}`
              }}
            >
              <div className="aspect-square rounded-xl mb-4" style={{ backgroundColor: colors.bg.primary }}></div>
              <div className="h-6 rounded mb-2" style={{ backgroundColor: colors.bg.primary }}></div>
              <div className="h-4 rounded w-3/4 mb-4" style={{ backgroundColor: colors.bg.primary }}></div>
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 rounded" style={{ backgroundColor: colors.bg.primary }}></div>
                <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: colors.bg.primary }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
