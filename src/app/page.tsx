import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductsSection from '@/components/ProductsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
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

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price.toString(),
    measures: p.measures,
    whatsappMsg: p.whatsappMsg,
    categoryId: p.categoryId,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
    images: p.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt, isPrimary: img.isPrimary })),
  }));

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
