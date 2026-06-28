import Link from 'next/link';
import { getFeaturedProducts, getCategories } from '@/lib/queries';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-100">
            New season, new essentials
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            Thoughtfully made goods for everyday life.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Curated apparel, accessories, home goods and tech — all in one place.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Shop all products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center font-semibold text-gray-900 transition hover:border-brand-500 hover:text-brand-600"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured products</h2>
          <Link href="/products" className="text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
