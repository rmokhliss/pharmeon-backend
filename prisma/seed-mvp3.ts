import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // ── Fournisseurs ──────────────────────────────────────────────
  const fournisseurs = await Promise.all([
    prisma.fournisseur.upsert({ where: { id: 1 }, update: {}, create: { nom: 'Cooper Pharma', ville: 'Casablanca', telephone: '+212 5 22 49 79 00' } }),
    prisma.fournisseur.upsert({ where: { id: 2 }, update: {}, create: { nom: 'Sothema', ville: 'Bouskoura', telephone: '+212 5 22 43 70 40', contact: 'Direction commerciale' } }),
    prisma.fournisseur.upsert({ where: { id: 3 }, update: {}, create: { nom: 'Bendemrane Distribution', ville: 'Tanger', telephone: '+212 6 42 68 37 58', contact: 'M. Bendemrane' } }),
    prisma.fournisseur.upsert({ where: { id: 4 }, update: {}, create: { nom: 'Alina Distribution', ville: 'Casablanca', telephone: '+212 5 22 35 98 01', contact: 'Service commercial' } }),
    prisma.fournisseur.upsert({ where: { id: 5 }, update: {}, create: { nom: 'NUXE Maroc', ville: 'Casablanca', contact: 'Représentant NUXE' } }),
    prisma.fournisseur.upsert({ where: { id: 6 }, update: {}, create: { nom: 'La Roche-Posay Maroc', ville: 'Casablanca', contact: 'Délégué L\'Oréal' } }),
    prisma.fournisseur.upsert({ where: { id: 7 }, update: {}, create: { nom: 'Organica Group', ville: 'Marrakech', contact: 'Direction export' } }),
    prisma.fournisseur.upsert({ where: { id: 8 }, update: {}, create: { nom: 'Gold Cosmetic Lab', ville: 'Casablanca', telephone: '+212 5 22 66 10 20', contact: 'M. Rachidi' } }),
  ]);

  // ── Clients ───────────────────────────────────────────────────
  const clients = await Promise.all([
    // Pharmacies
    prisma.client.upsert({ where: { id: 1 }, update: {}, create: { nom: 'Pharmacie Oussama', type: 'PHARMACIE', ville: 'Casablanca', telephone: '+212 5 22 73 57 37', adresse: 'Hay El Qods, Sidi Bernoussi' } }),
    prisma.client.upsert({ where: { id: 2 }, update: {}, create: { nom: 'Pharmacie Centrale', type: 'PHARMACIE', ville: 'Marrakech', telephone: '+212 5 24 43 01 58', adresse: 'Avenue Mohamed V' } }),
    prisma.client.upsert({ where: { id: 3 }, update: {}, create: { nom: 'Pharmacie du Maghreb', type: 'PHARMACIE', ville: 'Benslimane', telephone: '+212 5 23 29 66 33' } }),
    prisma.client.upsert({ where: { id: 4 }, update: {}, create: { nom: 'Pharmacie Atlas Al Kabir', type: 'PHARMACIE', ville: 'Salé', telephone: '+212 5 37 80 66 66', adresse: 'Av Atlas Al Kabir, Hay Essalam' } }),
    prisma.client.upsert({ where: { id: 5 }, update: {}, create: { nom: 'Pharmacie Moulay El Kamel', type: 'PHARMACIE', ville: 'Fès', telephone: '+212 5 35 62 66 36' } }),
    prisma.client.upsert({ where: { id: 6 }, update: {}, create: { nom: 'Pharmacie Al Qods', type: 'PHARMACIE', ville: 'Fès', telephone: '+212 5 35 65 50 68', adresse: 'Avenue El Kebir, Bensouda' } }),
    prisma.client.upsert({ where: { id: 7 }, update: {}, create: { nom: 'Pharmacie Populaire', type: 'PHARMACIE', ville: 'Marrakech', telephone: '+212 5 24 38 22 93', adresse: 'Place Riad Laarouss' } }),
    prisma.client.upsert({ where: { id: 8 }, update: {}, create: { nom: 'Pharmacie Anza', type: 'PHARMACIE', ville: 'Agadir' } }),
    // Paras
    prisma.client.upsert({ where: { id: 9 }, update: {}, create: { nom: 'Yves Rocher Mers Sultan', type: 'PARA', ville: 'Casablanca', telephone: '+212 5 22 26 67 10', adresse: '47 Avenue Mers Sultan' } }),
    prisma.client.upsert({ where: { id: 10 }, update: {}, create: { nom: 'Faces Casablanca', type: 'PARA', ville: 'Casablanca', adresse: 'Morocco Mall' } }),
    prisma.client.upsert({ where: { id: 11 }, update: {}, create: { nom: 'Nova Parapharmacie', type: 'PARA', ville: 'Casablanca' } }),
    prisma.client.upsert({ where: { id: 12 }, update: {}, create: { nom: 'Argalista', type: 'PARA', ville: 'Marrakech' } }),
  ]);

  // ── Stock movements ───────────────────────────────────────────
  // Get some products to work with
  const products = await prisma.product.findMany({ take: 12, orderBy: { id: 'asc' } });
  if (products.length === 0) { console.log('No products found — run main seed first'); return; }

  const p = (i: number) => products[i % products.length];

  const mouvements = [
    // Entrées (réceptions fournisseurs)
    { type: 'ENTREE', quantite: 50, productId: p(0).id, fournisseurId: fournisseurs[0].id, note: 'Livraison Cooper Pharma mars' },
    { type: 'ENTREE', quantite: 30, productId: p(1).id, fournisseurId: fournisseurs[4].id, note: 'Réception NUXE Huile Prodigieuse' },
    { type: 'ENTREE', quantite: 24, productId: p(2).id, fournisseurId: fournisseurs[5].id, note: 'Commande La Roche-Posay' },
    { type: 'ENTREE', quantite: 60, productId: p(3).id, fournisseurId: fournisseurs[3].id, note: 'Livraison Alina Distribution' },
    { type: 'ENTREE', quantite: 40, productId: p(4).id, fournisseurId: fournisseurs[1].id, note: 'Sothema — lot printemps' },
    { type: 'ENTREE', quantite: 20, productId: p(5).id, fournisseurId: fournisseurs[6].id, note: 'Organica Group — argan bio' },
    { type: 'ENTREE', quantite: 35, productId: p(6).id, fournisseurId: fournisseurs[2].id, note: 'Bendemrane — réassort' },
    { type: 'ENTREE', quantite: 45, productId: p(7).id, fournisseurId: fournisseurs[7].id, note: 'Gold Cosmetic Lab commande mensuelle' },
    // Sorties (ventes clients)
    { type: 'SORTIE', quantite: 10, productId: p(0).id, clientId: clients[0].id, note: 'Commande Pharmacie Oussama' },
    { type: 'SORTIE', quantite: 6,  productId: p(1).id, clientId: clients[1].id, note: 'Livraison Pharmacie Centrale Marrakech' },
    { type: 'SORTIE', quantite: 12, productId: p(2).id, clientId: clients[8].id, note: 'Yves Rocher Mers Sultan' },
    { type: 'SORTIE', quantite: 5,  productId: p(3).id, clientId: clients[3].id, note: 'Pharmacie Atlas Al Kabir' },
    { type: 'SORTIE', quantite: 8,  productId: p(4).id, clientId: clients[9].id, note: 'Faces Morocco Mall' },
    { type: 'SORTIE', quantite: 3,  productId: p(5).id, clientId: clients[4].id, note: 'Pharmacie Moulay El Kamel' },
    { type: 'SORTIE', quantite: 15, productId: p(6).id, clientId: clients[10].id, note: 'Nova Parapharmacie' },
    { type: 'SORTIE', quantite: 7,  productId: p(7).id, clientId: clients[2].id, note: 'Pharmacie du Maghreb' },
    { type: 'SORTIE', quantite: 4,  productId: p(8 % products.length).id, clientId: clients[6].id, note: 'Pharmacie Populaire Marrakech' },
    { type: 'SORTIE', quantite: 9,  productId: p(9 % products.length).id, clientId: clients[11].id, note: 'Argalista Marrakech' },
  ];

  // Create movements and update stock
  for (const m of mouvements) {
    const delta = m.type === 'ENTREE' ? m.quantite : -m.quantite;
    await prisma.$transaction([
      prisma.stockMovement.create({ data: m }),
      prisma.product.update({ where: { id: m.productId }, data: { stock: { increment: delta } } }),
    ]);
  }

  console.log(`✓ ${fournisseurs.length} fournisseurs`);
  console.log(`✓ ${clients.length} clients`);
  console.log(`✓ ${mouvements.length} mouvements de stock`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
