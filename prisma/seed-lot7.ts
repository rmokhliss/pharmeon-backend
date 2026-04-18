import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertClientByEmail(
  email: string,
  password: string,
  data: {
    nom: string;
    role: string;
    type: string;
    telephone?: string;
    ville?: string;
    code_postal?: string;
    adresse?: string;
    contact_nom?: string;
    ice?: string;
    patente?: string;
    rc?: string;
    site_web?: string;
  },
) {
  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing) {
    return prisma.client.update({
      where: { id: existing.id },
      data: { ...data, email, password: hashed, actif: true, approved: true },
    });
  }
  return prisma.client.create({
    data: { ...data, email, password: hashed, actif: true, approved: true },
  });
}

async function upsertLivreurByNom(data: {
  nom: string;
  telephone?: string;
  ville?: string;
  vehicule?: string;
  cin?: string;
  note?: string;
}) {
  const existing = await prisma.livreur.findFirst({ where: { nom: data.nom } });
  if (existing) return prisma.livreur.update({ where: { id: existing.id }, data });
  return prisma.livreur.create({ data });
}

async function upsertCommandeByReference(
  reference: string,
  clientId: number,
  statut: string,
  items: { productId: number; quantite: number; prixUnitaire: number }[],
  note?: string,
) {
  const existing = await prisma.commande.findUnique({ where: { reference } });
  if (existing) {
    return prisma.commande.update({
      where: { id: existing.id },
      data: { statut, note, updatedAt: new Date() },
      include: { items: true },
    });
  }
  return prisma.commande.create({
    data: {
      reference,
      clientId,
      statut,
      note,
      items: {
        create: items.map((it) => ({
          productId: it.productId,
          quantite: it.quantite,
          prixUnitaire: it.prixUnitaire,
          original_price: it.prixUnitaire,
          final_price: it.prixUnitaire,
        })),
      },
    },
    include: { items: true },
  });
}

async function upsertBonLivraisonByReference(
  reference: string,
  commandeId: number,
  livreurId: number,
  delivery_date: Date,
  tracking_number: string,
) {
  const existing = await prisma.bonLivraison.findUnique({ where: { reference } });
  if (existing) {
    return prisma.bonLivraison.update({
      where: { id: existing.id },
      data: { commandeId, livreurId, delivery_date, tracking_number, statut: 'LIVRE' },
    });
  }
  return prisma.bonLivraison.create({
    data: { reference, commandeId, livreurId, delivery_date, tracking_number, statut: 'LIVRE' },
  });
}

async function upsertFactureByReference(
  reference: string,
  commandeId: number,
  total_ht: number,
  total_ttc: number,
  issued_at: Date,
) {
  const existing = await prisma.facture.findUnique({ where: { reference } });
  if (existing) {
    return prisma.facture.update({
      where: { id: existing.id },
      data: { commandeId, total_ht, total_ttc, statut: 'EMISE', issued_at },
    });
  }
  return prisma.facture.create({
    data: { reference, commandeId, total_ht, total_ttc, statut: 'EMISE', issued_at },
  });
}

async function main() {
  // ─── Test accounts ────────────────────────────────────────────
  const client = await upsertClientByEmail('client@pharmeon.ma', 'client', {
    nom: 'Mehdi Client Démo',
    role: 'CLIENT_PUBLIC',
    type: 'PARTICULIER',
    telephone: '+212 6 61 12 34 56',
    ville: 'Casablanca',
    code_postal: '20250',
    adresse: '12 rue des Orangers, Maârif',
  });

  const pro = await upsertClientByEmail('pro@pharmeon.ma', 'pro', {
    nom: 'Pharmacie Pro Démo',
    role: 'PRO',
    type: 'PHARMACIE',
    telephone: '+212 5 22 99 88 77',
    ville: 'Rabat',
    code_postal: '10000',
    adresse: '45 avenue Mohammed V',
    contact_nom: 'Dr. Zineb Alaoui',
    ice: '001234567000089',
    patente: '30123456',
    rc: 'CAS-98765',
    site_web: 'https://pharmacie-pro-demo.ma',
  });

  console.log(`✓ Comptes démo : ${client.email} (${client.role}) / ${pro.email} (${pro.role})`);

  // ─── Livreurs ─────────────────────────────────────────────────
  const livreurs = await Promise.all([
    upsertLivreurByNom({ nom: 'Youssef Benali', telephone: '+212 6 12 34 56 78', ville: 'Casablanca', vehicule: 'Scooter Yamaha', cin: 'BE123456' }),
    upsertLivreurByNom({ nom: 'Rachid Amrani',  telephone: '+212 6 23 45 67 89', ville: 'Rabat',      vehicule: 'Renault Kangoo', cin: 'AD234567' }),
    upsertLivreurByNom({ nom: 'Karim Hassani',  telephone: '+212 6 34 56 78 90', ville: 'Marrakech',  vehicule: 'Scooter Peugeot', cin: 'MA345678' }),
    upsertLivreurByNom({ nom: 'Saïd El Idrissi', telephone: '+212 6 45 67 89 01', ville: 'Fès',       vehicule: 'Dacia Dokker', cin: 'FA456789', note: 'Disponible soirs et week-ends' }),
  ]);
  console.log(`✓ ${livreurs.length} livreurs`);

  // ─── Enrich fournisseurs with pro-identity ───────────────────
  const fournEnrich = [
    { id: 1, ice: '001111111000011', patente: '30111111', rc: 'CAS-11111', site_web: 'https://cooperpharma.ma', contact: 'Direction commerciale' },
    { id: 2, ice: '002222222000022', patente: '30222222', rc: 'CAS-22222', site_web: 'https://sothema.ma' },
    { id: 3, ice: '003333333000033', patente: '30333333', rc: 'TAN-33333' },
    { id: 4, ice: '004444444000044', patente: '30444444', rc: 'CAS-44444' },
    { id: 5, ice: '005555555000055', patente: '30555555', rc: 'CAS-55555', site_web: 'https://nuxe.ma' },
    { id: 6, ice: '006666666000066', patente: '30666666', rc: 'CAS-66666', site_web: 'https://laroche-posay.ma' },
    { id: 7, ice: '007777777000077', patente: '30777777', rc: 'MAR-77777' },
    { id: 8, ice: '008888888000088', patente: '30888888', rc: 'CAS-88888' },
  ];
  for (const f of fournEnrich) {
    await prisma.fournisseur.updateMany({ where: { id: f.id }, data: { ice: f.ice, patente: f.patente, rc: f.rc, site_web: f.site_web, contact: f.contact } });
  }
  console.log(`✓ ${fournEnrich.length} fournisseurs enrichis`);

  // ─── Product images (fill where null) ────────────────────────
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
  const imagePool = [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
  ];
  let imageUpdates = 0;
  for (let i = 0; i < products.length; i++) {
    if (!products[i].image_url) {
      await prisma.product.update({ where: { id: products[i].id }, data: { image_url: imagePool[i % imagePool.length] } });
      imageUpdates++;
    }
  }
  console.log(`✓ ${imageUpdates} produits avec image_url ajoutée`);

  if (products.length < 4) {
    console.log('⚠️  Pas assez de produits pour créer des commandes démo. Lance d\'abord un seed principal.');
    return;
  }

  // Pick 4 products with role-aware pricing
  const prods = products.slice(0, 4);
  const priceFor = (p: (typeof products)[number], role: string) => {
    if (role === 'PRO') return p.wholesale_price && p.wholesale_price > 0 ? p.wholesale_price : p.prix_vente;
    return p.retail_price && p.retail_price > 0 ? p.retail_price : p.prix_vente;
  };

  // ─── Commandes client public ─────────────────────────────────
  const cItems1 = [
    { productId: prods[0].id, quantite: 2, prixUnitaire: priceFor(prods[0], 'CLIENT_PUBLIC') },
    { productId: prods[1].id, quantite: 1, prixUnitaire: priceFor(prods[1], 'CLIENT_PUBLIC') },
  ];
  await upsertCommandeByReference('CMD-LOT7-C1', client.id, 'EN_ATTENTE', cItems1, 'Commande web — en attente de validation');

  const cItems2 = [
    { productId: prods[2].id, quantite: 3, prixUnitaire: priceFor(prods[2], 'CLIENT_PUBLIC') },
  ];
  await upsertCommandeByReference('CMD-LOT7-C2', client.id, 'VALIDEE', cItems2, 'Commande validée — en préparation');

  const cItems3 = [
    { productId: prods[0].id, quantite: 1, prixUnitaire: priceFor(prods[0], 'CLIENT_PUBLIC') },
    { productId: prods[3].id, quantite: 2, prixUnitaire: priceFor(prods[3], 'CLIENT_PUBLIC') },
  ];
  const cmdC3 = await upsertCommandeByReference('CMD-LOT7-C3', client.id, 'LIVREE', cItems3, 'Commande livrée la semaine dernière');

  // ─── Commandes pro ───────────────────────────────────────────
  const pItems1 = [
    { productId: prods[0].id, quantite: 10, prixUnitaire: priceFor(prods[0], 'PRO') },
    { productId: prods[1].id, quantite: 8,  prixUnitaire: priceFor(prods[1], 'PRO') },
  ];
  await upsertCommandeByReference('CMD-LOT7-P1', pro.id, 'EN_ATTENTE', pItems1, 'Réassort mensuel pharmacie');

  const pItems2 = [
    { productId: prods[2].id, quantite: 15, prixUnitaire: priceFor(prods[2], 'PRO') },
    { productId: prods[3].id, quantite: 20, prixUnitaire: priceFor(prods[3], 'PRO') },
  ];
  await upsertCommandeByReference('CMD-LOT7-P2', pro.id, 'EN_COURS', pItems2, 'En cours de préparation');

  const pItems3 = [
    { productId: prods[0].id, quantite: 12, prixUnitaire: priceFor(prods[0], 'PRO') },
    { productId: prods[1].id, quantite: 10, prixUnitaire: priceFor(prods[1], 'PRO') },
    { productId: prods[2].id, quantite: 6,  prixUnitaire: priceFor(prods[2], 'PRO') },
  ];
  const cmdP3 = await upsertCommandeByReference('CMD-LOT7-P3', pro.id, 'LIVREE', pItems3, 'Livrée et facturée');

  console.log('✓ 6 commandes démo (3 client public / 3 pro)');

  // ─── BL + Facture for the two LIVREE commandes ───────────────
  const livrees = [
    { cmd: cmdC3, ref: 'BL-LOT7-C3', factRef: 'FAC-LOT7-C3', livreur: livreurs[0], offsetDays: 6, tracking: 'PH-C3-240412' },
    { cmd: cmdP3, ref: 'BL-LOT7-P3', factRef: 'FAC-LOT7-P3', livreur: livreurs[1], offsetDays: 3, tracking: 'PH-P3-240415' },
  ];
  for (const l of livrees) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() - l.offsetDays);
    await upsertBonLivraisonByReference(l.ref, l.cmd.id, l.livreur.id, deliveryDate, l.tracking);
    const items = await prisma.commandeItem.findMany({ where: { commandeId: l.cmd.id } });
    const total_ttc = items.reduce((s, it) => s + (it.final_price ?? it.prixUnitaire) * it.quantite, 0);
    const total_ht = Math.round((total_ttc / 1.2) * 100) / 100;
    await upsertFactureByReference(l.factRef, l.cmd.id, total_ht, total_ttc, deliveryDate);
  }
  console.log(`✓ ${livrees.length} BL + factures pour les commandes livrées`);

  // ─── Stock adjustement ──────────────────────────────────────
  const adjRef = 'ADJ-LOT7-001';
  const existingAdj = await prisma.stockAdjustement.findUnique({ where: { reference: adjRef } });
  if (!existingAdj) {
    await prisma.stockAdjustement.create({
      data: {
        reference: adjRef,
        type: 'INVENTAIRE',
        statut: 'VALIDE',
        note: 'Ajustement inventaire Q1 — correction stock théorique',
        items: {
          create: [
            { productId: prods[0].id, quantite: 3,  cost_price: prods[0].cost_price ?? prods[0].prix_achat },
            { productId: prods[1].id, quantite: -2, cost_price: prods[1].cost_price ?? prods[1].prix_achat },
            { productId: prods[2].id, quantite: 1,  cost_price: prods[2].cost_price ?? prods[2].prix_achat },
          ],
        },
      },
    });
    console.log('✓ 1 ajustement de stock démo');
  } else {
    console.log('• ajustement démo déjà présent');
  }

  console.log('\n📋 Comptes de test :');
  console.log('  Public : client@pharmeon.ma / client');
  console.log('  Pro    : pro@pharmeon.ma / pro');
  console.log('  Admin  : défini dans .env (ADMIN_USERNAME / ADMIN_PASSWORD)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
