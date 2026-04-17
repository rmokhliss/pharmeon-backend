import { PrismaClient } from '@prisma/client';
import { seedProducts } from '../seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { reference: product.reference },
      update: {},
      create: product,
    });
  }
  console.log(`${seedProducts.length} products seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
