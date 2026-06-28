'use client';

import Link from 'next/link';
import { useCart } from './cart-provider';

export function Navbar() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-brand-700">
          NOVA<span className="text-gray-900">shop</span>
        </Link>

        <nav className="hidden gap-8 text-sm font-medium text-gray-600 md:flex">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <Link href="/products" className="hover:text-brand-600">
            All Products
          </Link>
        </nav>

        <Link
          href="/cart"
          className="relative inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Cart
          {itemCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-brand-700">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
