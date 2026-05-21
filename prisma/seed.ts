import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin123' },
    update: {},
    create: {
      username: 'admin123',
      password: hashedPassword,
    },
  });
  console.log('Admin user created:', admin.username);

  // Create categories
  const categories = [
    { name: 'Imanes', slug: 'imanes', order: 1 },
    { name: 'Portacelulares', slug: 'portacelulares', order: 2 },
    { name: 'Centros de Mesa', slug: 'centros-de-mesa', order: 3 },
    { name: 'Llaveros', slug: 'llaveros', order: 4 },
    { name: 'Cuadro 12 Meses', slug: 'cuadro-12-meses', order: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Categories created:', categories.map((c) => c.name).join(', '));

  // Get categories for product creation
  const imanesCategory = await prisma.category.findUnique({ where: { slug: 'imanes' } });
  const portacelularesCategory = await prisma.category.findUnique({ where: { slug: 'portacelulares' } });
  const llaverosCategory = await prisma.category.findUnique({ where: { slug: 'llaveros' } });

  if (!imanesCategory || !portacelularesCategory || !llaverosCategory) {
    throw new Error('Categories not found after creation');
  }

  // Create sample products
  const products = [
    {
      name: 'Imán Personalizado',
      description:
        'Imán de MDF personalizado con tu foto, nombre o diseño favorito. Ideal para regalar o decorar tu heladera. Fabricado artesanalmente con MDF de alta calidad y terminaciones impecables.',
      price: 1700,
      measures: '7cm x 5cm',
      whatsappMsg: 'Hola! Me interesa el imán personalizado. ¿Cuáles son los diseños disponibles?',
      categoryId: imanesCategory.id,
      active: true,
      order: 1,
    },
    {
      name: 'Imán Rectangular con Foto',
      description:
        'Imán rectangular de MDF con foto personalizada. Perfecto como souvenir de bodas, cumpleaños o cualquier evento especial. Laminado para proteger la imagen.',
      price: 1700,
      measures: '9cm x 6cm',
      whatsappMsg:
        'Hola! Me interesa el imán rectangular con foto. ¿Cuánto tiempo de entrega tienen?',
      categoryId: imanesCategory.id,
      active: true,
      order: 2,
    },
    {
      name: 'Portacelular de Mesa',
      description:
        'Portacelular de escritorio en MDF, elegante y funcional. Disponible en distintos colores y con la posibilidad de personalizarlo con tu nombre o diseño. Soporte estable y resistente.',
      price: 3500,
      measures: '12cm x 8cm x 5cm',
      whatsappMsg:
        'Hola! Estoy interesado/a en el portacelular de mesa. ¿En qué colores está disponible?',
      categoryId: portacelularesCategory.id,
      active: true,
      order: 1,
    },
    {
      name: 'Llavero Personalizado',
      description:
        'Llavero de MDF cortado a láser con diseño personalizado. Ideal para souvenirs de eventos, empresas o regalos únicos. Resistente y liviano.',
      price: 800,
      measures: '5cm x 3cm',
      whatsappMsg:
        'Hola! Me interesa el llavero personalizado. ¿Qué tipo de diseños pueden hacer?',
      categoryId: llaverosCategory.id,
      active: true,
      order: 1,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name, categoryId: product.categoryId },
    });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }

  console.log('Sample products created');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
