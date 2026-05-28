import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductsSection from '@/components/ProductsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }, { createdAt: 'desc' }],
    }).catch(() => []),
    prisma.category.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
  ]);

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
