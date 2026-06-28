import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSQLite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Home & Living', slug: 'home-living' },
  { name: 'Electronics', slug: 'electronics' },
];

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  stock: number;
  featured: boolean;
  categorySlug: string;
};

const products: SeedProduct[] = [
  {
    name: 'Classic Cotton Tee',
    description: 'A soft, breathable 100% organic cotton t-shirt that works for any occasion.',
    price: 2499,
    stock: 120,
    featured: true,
    categorySlug: 'apparel',
  },
  {
    name: 'Merino Wool Sweater',
    description: 'Lightweight merino wool sweater that keeps you warm without the bulk.',
    price: 8900,
    stock: 45,
    featured: true,
    categorySlug: 'apparel',
  },
  {
    name: 'Denim Jacket',
    description: 'Timeless washed denim jacket with a relaxed modern fit.',
    price: 11900,
    stock: 30,
    featured: false,
    categorySlug: 'apparel',
  },
  {
    name: 'Leather Belt',
    description: 'Full-grain leather belt with a brushed steel buckle.',
    price: 4500,
    stock: 80,
    featured: false,
    categorySlug: 'accessories',
  },
  {
    name: 'Canvas Tote Bag',
    description: 'Durable heavyweight canvas tote, perfect for groceries or the beach.',
    price: 1900,
    stock: 200,
    featured: true,
    categorySlug: 'accessories',
  },
  {
    name: 'Minimalist Watch',
    description: 'Clean dial, sapphire glass, and a genuine leather strap.',
    price: 14900,
    stock: 25,
    featured: true,
    categorySlug: 'accessories',
  },
  {
    name: 'Ceramic Mug Set',
    description: 'Set of four hand-glazed ceramic mugs in earthy tones.',
    price: 3900,
    stock: 60,
    featured: false,
    categorySlug: 'home-living',
  },
  {
    name: 'Scented Soy Candle',
    description: 'Hand-poured soy candle with notes of sandalwood and vanilla. 50h burn time.',
    price: 2200,
    stock: 150,
    featured: false,
    categorySlug: 'home-living',
  },
  {
    name: 'Linen Throw Blanket',
    description: 'Stonewashed linen throw that gets softer with every wash.',
    price: 6900,
    stock: 40,
    featured: true,
    categorySlug: 'home-living',
  },
  {
    name: 'Wireless Earbuds',
    description: 'Compact wireless earbuds with active noise cancellation and 24h battery.',
    price: 12900,
    stock: 70,
    featured: true,
    categorySlug: 'electronics',
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Pocket-sized speaker with surprisingly big sound and IPX7 waterproofing.',
    price: 5900,
    stock: 90,
    featured: false,
    categorySlug: 'electronics',
  },
  {
    name: 'Fast Charging Power Bank',
    description: '20,000mAh power bank with USB-C PD fast charging for phones and laptops.',
    price: 4900,
    stock: 110,
    featured: false,
    categorySlug: 'electronics',
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding database...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    categoryMap.set(category.slug, created.id);
  }

  for (const product of products) {
    const slug = slugify(product.name);
    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        featured: product.featured,
        image: `https://picsum.photos/seed/${slug}/600/600`,
        categoryId: categoryMap.get(product.categorySlug)!,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
