import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProductsByIds } from '@/lib/queries';

type IncomingItem = { id: string; quantity: number };

type OrderPayload = {
  customerName?: string;
  email?: string;
  address?: string;
  items?: IncomingItem[];
};

export async function POST(request: Request) {
  let payload: OrderPayload;
  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { customerName, email, address, items } = payload;

  if (!customerName?.trim() || !email?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: 'Name, email and address are required.' },
      { status: 400 },
    );
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const products = await getProductsByIds(items.map((i) => i.id));
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate every line against the database (price + stock are authoritative).
  for (const item of items) {
    const product = productMap.get(item.id);
    if (!product) {
      return NextResponse.json(
        { error: `Product no longer available.` },
        { status: 400 },
      );
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return NextResponse.json(
        { error: `Invalid quantity for ${product.name}.` },
        { status: 400 },
      );
    }
    if (item.quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} of ${product.name} left in stock.` },
        { status: 400 },
      );
    }
  }

  const total = items.reduce((sum, item) => {
    const product = productMap.get(item.id)!;
    return sum + product.price * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerName: customerName.trim(),
        email: email.trim(),
        address: address.trim(),
        total,
        items: {
          create: items.map((item) => {
            const product = productMap.get(item.id)!;
            return {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
            };
          }),
        },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json({ orderId: order.id, total: order.total }, { status: 201 });
}
