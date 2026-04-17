import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RUPTURE_REFS = ['VIS-010', 'CHV-012', 'MAQ-008', 'BBY-007', 'BDT-009'];

const IMAGES: Record<string, string> = {
  // Visage
  'VIS-001': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
  'VIS-002': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
  'VIS-003': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
  'VIS-004': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'VIS-005': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop',
  'VIS-006': 'https://images.unsplash.com/photo-1620916566259-17e85b6e5b5e?w=300&h=300&fit=crop',
  'VIS-007': 'https://images.unsplash.com/photo-1620916566259-17e85b6e5b5e?w=300&h=300&fit=crop',
  'VIS-008': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
  'VIS-009': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
  'VIS-010': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop',
  // Cheveux
  'CHV-001': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-002': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-003': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-004': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop',
  'CHV-005': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-006': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-007': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-008': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
  'CHV-009': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-010': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-011': 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=300&h=300&fit=crop',
  'CHV-012': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop',
  // Corps
  'CRP-001': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
  'CRP-002': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
  'CRP-003': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
  'CRP-004': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop',
  'CRP-005': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=300&fit=crop',
  'CRP-006': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop',
  'CRP-007': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  'CRP-008': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  // Solaire
  'SOL-001': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-002': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-003': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-004': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-005': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-006': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-007': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-008': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  'SOL-009': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop',
  // Maquillage
  'MAQ-001': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-002': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-003': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-004': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-005': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-006': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-007': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-008': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-009': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  'MAQ-010': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
  // Bébé & Maman
  'BBY-001': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  'BBY-002': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  'BBY-003': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  'BBY-004': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  'BBY-005': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  'BBY-006': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  'BBY-007': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop',
  // Bucco-Dentaire
  'BDT-001': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-002': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-003': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-004': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-005': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-006': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-007': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-008': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-009': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
  'BDT-010': 'https://images.unsplash.com/photo-1559591937-f4c2e2ab5e84?w=300&h=300&fit=crop',
};

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, reference: true } });

  for (const p of products) {
    const isRupture = RUPTURE_REFS.includes(p.reference);
    await prisma.product.update({
      where: { id: p.id },
      data: {
        stock: isRupture ? 0 : Math.floor(Math.random() * 40) + 15,
        image_url: IMAGES[p.reference] || null,
      },
    });
  }

  console.log(`Updated ${products.length} products. ${RUPTURE_REFS.length} set to rupture.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
