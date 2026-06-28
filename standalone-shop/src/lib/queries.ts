import { prisma } from './prisma';

export function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });
}

export function getProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : undefined,
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export function getProductsByIds(ids: string[]) {
  return prisma.product.findMany({
    where: { id: { in: ids } },
  });
}
