import Link from 'next/link';
import { formatPrice } from '@/lib/format';

type Props = {
  product: {
    slug: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category: { name: string };
  };
};

export function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {product.category.name}
        </span>
        <h3 className="mt-1 font-semibold text-gray-900">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.stock === 0 && (
            <span className="text-xs font-medium text-red-500">Sold out</span>
          )}
        </div>
      </div>
    </Link>
  );
}
