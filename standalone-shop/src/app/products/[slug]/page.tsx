import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/queries';
import { formatPrice } from '@/lib/format';
import { AddToCartButton } from '@/components/add-to-cart-button';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/products" className="text-sm text-brand-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {product.category.name}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>

          <p className="mt-6 leading-relaxed text-gray-600">{product.description}</p>

          <p className="mt-4 text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
          </p>

          <div className="mt-8 max-w-xs">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image,
              }}
              outOfStock={product.stock === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
