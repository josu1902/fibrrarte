export const revalidate = 300;

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductsSection from '@/components/ProductsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

async function getHomeData() {
  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  const products = rawProducts.map((p) => ({ ...p, price: p.price.toString() }));
  return { products, categories };
}

export default async function Home() {
  const { products, categories } = await getHomeData();

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ProductsSection initialProducts={products} initialCategories={categories} />
      <ContactSection />
      <Footer />
    </main>
  );
}
