'use client';

import { useState } from 'react';
import { useCart, type CartItem } from './cart-provider';

type Props = {
  product: Omit<CartItem, 'quantity'>;
  outOfStock?: boolean;
};

export function AddToCartButton({ product, outOfStock }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (outOfStock) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-400"
      >
        Out of stock
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98]"
    >
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}
