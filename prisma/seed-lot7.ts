import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertClientByEmail(
  email: string,
  password: string | null,
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
  const hashed = password ? await bcrypt.hash(password, 10) : null;
  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing) {
    return prisma.client.update({
      where: { id: existing.id },
      data: { ...data, email, ...(hashed ? { password: hashed } : {}), actif: true, approved: true },
    });
  }
  return prisma.client.create({
    data: { ...data, email, ...(hashed ? { password: hashed } : {}), actif: true, approved: true },
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
  createdAt?: Date,
) {
  const existing = await prisma.commande.findUnique({ where: { reference } });
  const itemsData = items.map((it) => ({
    productId: it.productId,
    quantite: it.quantite,
    prixUnitaire: it.prixUnitaire,
    original_price: it.prixUnitaire,
    final_price: it.prixUnitaire,
  }));
  if (existing) {
    await prisma.commandeItem.deleteMany({ where: { commandeId: existing.id } });
    return prisma.commande.update({
      where: { id: existing.id },
      data: {
        clientId, statut, note,
        items: { create: itemsData },
        ...(createdAt ? { createdAt } : {}),
      },
      include: { items: true },
    });
  }
  return prisma.commande.create({
    data: {
      reference, clientId, statut, note,
      items: { create: itemsData },
      ...(createdAt ? { createdAt } : {}),
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
  statut = 'LIVRE',
) {
  const existing = await prisma.bonLivraison.findUnique({ where: { reference } });
  const data = { reference, commandeId, livreurId, delivery_date, tracking_number, statut };
  if (existing) return prisma.bonLivraison.update({ where: { id: existing.id }, data });
  return prisma.bonLivraison.create({ data });
}

async function upsertFactureByReference(
  reference: string,
  commandeId: number,
  total_ht: number,
  total_ttc: number,
  issued_at: Date,
  statut = 'EMISE',
) {
  const existing = await prisma.facture.findUnique({ where: { reference } });
  const data = { reference, commandeId, total_ht, total_ttc, statut, issued_at };
  if (existing) return prisma.facture.update({ where: { id: existing.id }, data });
  return prisma.facture.create({ data });
}

async function upsertDemandeByEmail(email: string, data: any) {
  const existing = await prisma.demandeAcces.findFirst({ where: { email } });
  if (existing) return prisma.demandeAcces.update({ where: { id: existing.id }, data: { ...data, email } });
  return prisma.demandeAcces.create({ data: { ...data, email } });
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

  // Extra demo clients (varied roles / cities)
  const extraClients = [
    { email: 'para.dz@pharmeon.ma', password: 'demo1234', data: { nom: 'Pharmacie Darkoum', role: 'PRO', type: 'PHARMACIE', telephone: '+212 5 23 38 11 22', ville: 'El Jadida', code_postal: '24000', adresse: '8 bd Ibn Khaldoun', contact_nom: 'Dr. Karim Saidi', ice: '002345678000091', patente: '30234567', rc: 'EJA-12345' } },
    { email: 'para.tetouan@pharmeon.ma', password: 'demo1234', data: { nom: 'Parapharmacie Andaloussia', role: 'PRO', type: 'PARA', telephone: '+212 5 39 97 41 00', ville: 'Tétouan', code_postal: '93000', adresse: '72 av. Mohamed V', contact_nom: 'Mme Nour El Fassi', ice: '003456789000072', patente: '30345678', rc: 'TET-54321' } },
    { email: 'fatima.bennani@mail.com', password: 'demo1234', data: { nom: 'Fatima Bennani', role: 'CLIENT_PUBLIC', type: 'PARTICULIER', telephone: '+212 6 12 78 45 90', ville: 'Marrakech', code_postal: '40000', adresse: '5 résidence Menara' } },
    { email: 'youssef.alami@mail.com', password: 'demo1234', data: { nom: 'Youssef Alami', role: 'CLIENT_PUBLIC', type: 'PARTICULIER', telephone: '+212 6 99 22 33 11', ville: 'Rabat', code_postal: '10020', adresse: '21 rue des Ambassadeurs, Agdal' } },
  ];
  for (const c of extraClients) await upsertClientByEmail(c.email, c.password, c.data as any);

  console.log(`✓ Comptes démo : ${client.email} / ${pro.email} + ${extraClients.length} clients supplémentaires`);

  // ─── Livreurs ─────────────────────────────────────────────────
  const livreurs = await Promise.all([
    upsertLivreurByNom({ nom: 'Youssef Benali',   telephone: '+212 6 12 34 56 78', ville: 'Casablanca', vehicule: 'Scooter Yamaha NMAX',  cin: 'BE123456' }),
    upsertLivreurByNom({ nom: 'Rachid Amrani',    telephone: '+212 6 23 45 67 89', ville: 'Rabat',      vehicule: 'Renault Kangoo',       cin: 'AD234567' }),
    upsertLivreurByNom({ nom: 'Karim Hassani',    telephone: '+212 6 34 56 78 90', ville: 'Marrakech',  vehicule: 'Scooter Peugeot Kisbee',cin: 'MA345678' }),
    upsertLivreurByNom({ nom: 'Saïd El Idrissi',  telephone: '+212 6 45 67 89 01', ville: 'Fès',        vehicule: 'Dacia Dokker',         cin: 'FA456789', note: 'Disponible soirs et week-ends' }),
    upsertLivreurByNom({ nom: 'Mohamed Zerouali', telephone: '+212 6 56 78 90 12', ville: 'Tanger',     vehicule: 'Peugeot Partner',       cin: 'TA567890' }),
    upsertLivreurByNom({ nom: 'Hicham Ouazzani',  telephone: '+212 6 67 89 01 23', ville: 'Agadir',     vehicule: 'Scooter Honda PCX',     cin: 'AG678901', note: 'Spécialiste zones sud' }),
  ]);
  console.log(`✓ ${livreurs.length} livreurs`);

  // ─── Enrich fournisseurs ─────────────────────────────────────
  const fournEnrich = [
    { id: 1, ice: '001111111000011', patente: '30111111', rc: 'CAS-11111', site_web: 'https://cooperpharma.ma',  contact: 'Direction commerciale', adresse: 'Zone Industrielle Ain Sebaâ', code_postal: '20250' },
    { id: 2, ice: '002222222000022', patente: '30222222', rc: 'CAS-22222', site_web: 'https://sothema.ma',        contact: 'Service commercial',    adresse: 'Bouskoura Aéropôle',           code_postal: '20180' },
    { id: 3, ice: '003333333000033', patente: '30333333', rc: 'TAN-33333', contact: 'M. Bendemrane',                                                  adresse: 'Zone Franche Tanger',           code_postal: '90000' },
    { id: 4, ice: '004444444000044', patente: '30444444', rc: 'CAS-44444', contact: 'Service commercial',                                             adresse: 'Quartier Industriel Sidi Bernoussi', code_postal: '20600' },
    { id: 5, ice: '005555555000055', patente: '30555555', rc: 'CAS-55555', site_web: 'https://nuxe.ma',            contact: 'Représentant NUXE',     adresse: 'Bd Zerktouni',                 code_postal: '20100' },
    { id: 6, ice: '006666666000066', patente: '30666666', rc: 'CAS-66666', site_web: 'https://laroche-posay.ma',   contact: "Délégué L'Oréal",      adresse: 'Casablanca Twin Center',       code_postal: '20100' },
    { id: 7, ice: '007777777000077', patente: '30777777', rc: 'MAR-77777', contact: 'Direction export',                                                adresse: 'Zone Industrielle Sidi Ghanem', code_postal: '40000' },
    { id: 8, ice: '008888888000088', patente: '30888888', rc: 'CAS-88888', contact: 'M. Rachidi',                                                      adresse: 'Bd Mohammed VI',               code_postal: '20020' },
  ];
  for (const f of fournEnrich) {
    await prisma.fournisseur.updateMany({ where: { id: f.id }, data: f });
  }
  console.log(`✓ ${fournEnrich.length} fournisseurs enrichis`);

  // ─── Pricing matrix on all products ──────────────────────────
  const allProducts = await prisma.product.findMany({ orderBy: { id: 'asc' } });
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
  const round2 = (n: number) => Math.round(n * 100) / 100;
  let priceUpdates = 0;
  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const retail = p.retail_price && p.retail_price > 0 ? p.retail_price : p.prix_vente;
    const wholesale = round2(retail * 0.85); // wholesale ~15% below retail
    const costPrice = p.cost_price && p.cost_price > 0 ? p.cost_price : round2(p.prix_achat || wholesale * 0.75);
    // Promo patterns: every 5th retail on promo (8%), every 3rd pro gets volume discount (6%)
    const retailDiscount = i % 5 === 0 ? 8 : i % 7 === 0 ? 12 : 0;
    const wholesaleDiscount = i % 3 === 0 ? 6 : i % 9 === 0 ? 10 : 0;
    await prisma.product.update({
      where: { id: p.id },
      data: {
        retail_price: retail,
        wholesale_price: wholesale,
        cost_price: costPrice,
        retail_discount_pct: retailDiscount,
        wholesale_discount_pct: wholesaleDiscount,
        image_url: p.image_url ?? imagePool[i % imagePool.length],
      },
    });
    priceUpdates++;
  }
  console.log(`✓ ${priceUpdates} produits avec matrice prix (retail/wholesale + remises) + images`);

  if (allProducts.length < 4) {
    console.log("⚠️  Pas assez de produits — lance d'abord le seed principal.");
    return;
  }

  // Compute role-aware unit price from the *updated* product view
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
  const priceFor = (p: (typeof products)[number], role: string) => {
    const retail = p.retail_price ?? p.prix_vente;
    const wholesale = p.wholesale_price && p.wholesale_price > 0 ? p.wholesale_price : retail;
    const base = role === 'PRO' ? wholesale : retail;
    const disc = role === 'PRO' ? (p.wholesale_discount_pct || 0) : (p.retail_discount_pct || 0);
    return round2(base * (1 - disc / 100));
  };

  const prods = products.slice(0, 8);
  const today = new Date();
  const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };

  // ─── Client public — 4 commandes (statuts variés + historique) ──
  await upsertCommandeByReference('CMD-LOT7-C1', client.id, 'EN_ATTENTE', [
    { productId: prods[0].id, quantite: 2, prixUnitaire: priceFor(prods[0], 'CLIENT_PUBLIC') },
    { productId: prods[1].id, quantite: 1, prixUnitaire: priceFor(prods[1], 'CLIENT_PUBLIC') },
  ], 'Commande web — en attente de validation', daysAgo(1));

  await upsertCommandeByReference('CMD-LOT7-C2', client.id, 'VALIDEE', [
    { productId: prods[2].id, quantite: 3, prixUnitaire: priceFor(prods[2], 'CLIENT_PUBLIC') },
  ], 'Commande validée — en préparation', daysAgo(3));

  const cmdC3 = await upsertCommandeByReference('CMD-LOT7-C3', client.id, 'LIVREE', [
    { productId: prods[0].id, quantite: 1, prixUnitaire: priceFor(prods[0], 'CLIENT_PUBLIC') },
    { productId: prods[3].id, quantite: 2, prixUnitaire: priceFor(prods[3], 'CLIENT_PUBLIC') },
  ], 'Livrée la semaine dernière', daysAgo(8));

  const cmdC4 = await upsertCommandeByReference('CMD-LOT7-C4', client.id, 'LIVREE', [
    { productId: prods[4].id, quantite: 2, prixUnitaire: priceFor(prods[4], 'CLIENT_PUBLIC') },
    { productId: prods[5].id, quantite: 1, prixUnitaire: priceFor(prods[5], 'CLIENT_PUBLIC') },
  ], 'Livraison express — commande précédente', daysAgo(22));

  // ─── Pro — 4 commandes ───────────────────────────────────────
  await upsertCommandeByReference('CMD-LOT7-P1', pro.id, 'EN_ATTENTE', [
    { productId: prods[0].id, quantite: 10, prixUnitaire: priceFor(prods[0], 'PRO') },
    { productId: prods[1].id, quantite: 8,  prixUnitaire: priceFor(prods[1], 'PRO') },
  ], 'Réassort mensuel pharmacie', daysAgo(0));

  await upsertCommandeByReference('CMD-LOT7-P2', pro.id, 'EN_COURS', [
    { productId: prods[2].id, quantite: 15, prixUnitaire: priceFor(prods[2], 'PRO') },
    { productId: prods[3].id, quantite: 20, prixUnitaire: priceFor(prods[3], 'PRO') },
  ], 'En cours de préparation', daysAgo(2));

  const cmdP3 = await upsertCommandeByReference('CMD-LOT7-P3', pro.id, 'LIVREE', [
    { productId: prods[0].id, quantite: 12, prixUnitaire: priceFor(prods[0], 'PRO') },
    { productId: prods[1].id, quantite: 10, prixUnitaire: priceFor(prods[1], 'PRO') },
    { productId: prods[2].id, quantite: 6,  prixUnitaire: priceFor(prods[2], 'PRO') },
  ], 'Livrée et facturée — réassort hebdo', daysAgo(5));

  const cmdP4 = await upsertCommandeByReference('CMD-LOT7-P4', pro.id, 'LIVREE', [
    { productId: prods[4].id, quantite: 24, prixUnitaire: priceFor(prods[4], 'PRO') },
    { productId: prods[5].id, quantite: 18, prixUnitaire: priceFor(prods[5], 'PRO') },
    { productId: prods[6].id, quantite: 12, prixUnitaire: priceFor(prods[6], 'PRO') },
    { productId: prods[7].id, quantite: 8,  prixUnitaire: priceFor(prods[7], 'PRO') },
  ], 'Grosse commande trimestrielle', daysAgo(30));

  // ─── Commandes pour clients supplémentaires ──────────────────
  const extraByEmail: Record<string, any> = {};
  for (const c of extraClients) {
    extraByEmail[c.email] = await prisma.client.findUnique({ where: { email: c.email } });
  }
  const cDarkoum = extraByEmail['para.dz@pharmeon.ma'];
  const cAndaloussia = extraByEmail['para.tetouan@pharmeon.ma'];
  const cFatima = extraByEmail['fatima.bennani@mail.com'];
  const cYoussef = extraByEmail['youssef.alami@mail.com'];

  await upsertCommandeByReference('CMD-LOT7-X1', cDarkoum.id, 'LIVREE', [
    { productId: prods[1].id, quantite: 20, prixUnitaire: priceFor(prods[1], 'PRO') },
    { productId: prods[3].id, quantite: 15, prixUnitaire: priceFor(prods[3], 'PRO') },
  ], 'Commande El Jadida', daysAgo(12));

  await upsertCommandeByReference('CMD-LOT7-X2', cAndaloussia.id, 'VALIDEE', [
    { productId: prods[5].id, quantite: 10, prixUnitaire: priceFor(prods[5], 'PRO') },
    { productId: prods[6].id, quantite: 8,  prixUnitaire: priceFor(prods[6], 'PRO') },
  ], 'Validée — attente livreur Nord', daysAgo(1));

  await upsertCommandeByReference('CMD-LOT7-X3', cFatima.id, 'LIVREE', [
    { productId: prods[2].id, quantite: 1, prixUnitaire: priceFor(prods[2], 'CLIENT_PUBLIC') },
  ], 'Petite commande web', daysAgo(4));

  await upsertCommandeByReference('CMD-LOT7-X4', cYoussef.id, 'EN_ATTENTE', [
    { productId: prods[7].id, quantite: 2, prixUnitaire: priceFor(prods[7], 'CLIENT_PUBLIC') },
  ], 'Nouveau client Rabat', daysAgo(0));

  console.log('✓ 12 commandes démo (client/pro + 4 clients additionnels)');

  // ─── BL + factures pour les commandes LIVREE ─────────────────
  const livreesList = [
    { cmd: cmdC3, ref: 'BL-LOT7-C3', factRef: 'FAC-LOT7-C3', livreur: livreurs[0], offsetDays: 6, tracking: 'PH-C3-' + today.getFullYear() + '-0412' },
    { cmd: cmdP3, ref: 'BL-LOT7-P3', factRef: 'FAC-LOT7-P3', livreur: livreurs[1], offsetDays: 3, tracking: 'PH-P3-' + today.getFullYear() + '-0415' },
    { cmd: cmdC4, ref: 'BL-LOT7-C4', factRef: 'FAC-LOT7-C4', livreur: livreurs[2], offsetDays: 20, tracking: 'PH-C4-' + today.getFullYear() + '-0325' },
    { cmd: cmdP4, ref: 'BL-LOT7-P4', factRef: 'FAC-LOT7-P4', livreur: livreurs[3], offsetDays: 28, tracking: 'PH-P4-' + today.getFullYear() + '-0320' },
  ];
  for (const l of livreesList) {
    const deliveryDate = daysAgo(l.offsetDays);
    await upsertBonLivraisonByReference(l.ref, l.cmd.id, l.livreur.id, deliveryDate, l.tracking);
    const items = await prisma.commandeItem.findMany({ where: { commandeId: l.cmd.id } });
    const total_ttc = round2(items.reduce((s, it) => s + (it.final_price ?? it.prixUnitaire) * it.quantite, 0));
    const total_ht = round2(total_ttc / 1.2);
    await upsertFactureByReference(l.factRef, l.cmd.id, total_ht, total_ttc, deliveryDate);
  }
  console.log(`✓ ${livreesList.length} BL + factures`);

  // ─── Stock adjustements démo ─────────────────────────────────
  const adjustements = [
    { reference: 'ADJ-LOT7-001', type: 'INVENTAIRE', statut: 'VALIDE', note: 'Ajustement inventaire Q1 — écarts comptage', items: [
      { productId: prods[0].id, quantite: 3,  cost_price: prods[0].cost_price ?? prods[0].prix_achat },
      { productId: prods[1].id, quantite: -2, cost_price: prods[1].cost_price ?? prods[1].prix_achat },
      { productId: prods[2].id, quantite: 1,  cost_price: prods[2].cost_price ?? prods[2].prix_achat },
    ] },
    { reference: 'ADJ-LOT7-002', type: 'CASSE', statut: 'VALIDE', note: 'Casse magasin — chute étagère rayon soins', items: [
      { productId: prods[4].id, quantite: -3, cost_price: prods[4].cost_price ?? prods[4].prix_achat },
    ] },
    { reference: 'ADJ-LOT7-003', type: 'EXPIRATION', statut: 'VALIDE', note: 'Produits expirés — rotation mensuelle', items: [
      { productId: prods[5].id, quantite: -4, cost_price: prods[5].cost_price ?? prods[5].prix_achat },
      { productId: prods[6].id, quantite: -2, cost_price: prods[6].cost_price ?? prods[6].prix_achat },
    ] },
    { reference: 'ADJ-LOT7-004', type: 'INVENTAIRE', statut: 'EN_ATTENTE', note: 'Inventaire tournant semaine 15 — en cours de validation', items: [
      { productId: prods[3].id, quantite: -1, cost_price: prods[3].cost_price ?? prods[3].prix_achat },
      { productId: prods[7].id, quantite: 2,  cost_price: prods[7].cost_price ?? prods[7].prix_achat },
    ] },
  ];
  for (const a of adjustements) {
    const existing = await prisma.stockAdjustement.findUnique({ where: { reference: a.reference } });
    if (existing) {
      await prisma.stockAdjustementItem.deleteMany({ where: { adjustementId: existing.id } });
      await prisma.stockAdjustement.update({
        where: { id: existing.id },
        data: { type: a.type, statut: a.statut, note: a.note, items: { create: a.items } },
      });
    } else {
      await prisma.stockAdjustement.create({
        data: { reference: a.reference, type: a.type, statut: a.statut, note: a.note, items: { create: a.items } },
      });
    }
  }
  console.log(`✓ ${adjustements.length} ajustements stock`);

  // ─── Demandes d'accès en attente (pipeline commercial) ──────
  const demandes = [
    { email: 'contact@pharma-lissane.ma', nom: 'Pharmacie Lissane Addine', categorie: 'PRO', type: 'PHARMACIE', ville: 'Oujda', code_postal: '60000', adresse: '17 bd Hassan II', telephone: '+212 5 36 68 22 15', contact: 'Dr. Laila Chraibi', ice: '009111111000091', patente: '30991111', rc: 'OUJ-90001', message: 'Demande ouverture compte pro — pharmacie en activité depuis 2015' },
    { email: 'direction@para-atlas.ma', nom: 'Parapharmacie Atlas', categorie: 'PRO', type: 'PARA', ville: 'Beni Mellal', code_postal: '23000', adresse: '5 av. des FAR', telephone: '+212 5 23 48 11 09', contact: 'M. Omar Jebari', ice: '009222222000082', patente: '30992222', rc: 'BM-90002', site_web: 'https://para-atlas.ma', message: 'Intéressé par votre gamme dermocosmétique' },
    { email: 'yasmine.kabbaj@mail.com', nom: 'Yasmine Kabbaj', categorie: 'CLIENT_PUBLIC', type: 'PARTICULIER', ville: 'Casablanca', telephone: '+212 6 78 55 44 33', message: 'Souhaite commander régulièrement pour ma famille' },
    { email: 'clinique.soukaina@gmail.com', nom: 'Clinique Dentaire Soukaina', categorie: 'PRO', type: 'CLINIQUE', ville: 'Salé', code_postal: '11000', adresse: '9 rue Sebta', telephone: '+212 5 37 84 22 90', contact: 'Dr. Soukaina Mernissi', ice: '009333333000073', patente: '30993333', rc: 'SAL-90003', message: 'Commande de fournitures médicales et hygiène' },
  ];
  for (const d of demandes) {
    await upsertDemandeByEmail(d.email, { ...d, statut: 'EN_ATTENTE' });
  }
  console.log(`✓ ${demandes.length} demandes d'accès en attente`);

  // ─── Mouvements de stock additionnels ────────────────────────
  const mouvements = [
    { type: 'ENTREE', quantite: 100, productId: prods[0].id, fournisseurId: 1, note: 'Cooper Pharma — arrivage trimestriel' },
    { type: 'ENTREE', quantite: 80,  productId: prods[1].id, fournisseurId: 5, note: 'NUXE — réassort printemps' },
    { type: 'ENTREE', quantite: 60,  productId: prods[2].id, fournisseurId: 6, note: 'La Roche-Posay — commande mensuelle' },
    { type: 'ENTREE', quantite: 45,  productId: prods[3].id, fournisseurId: 2, note: 'Sothema — lot avril' },
    { type: 'ENTREE', quantite: 70,  productId: prods[4].id, fournisseurId: 4, note: 'Alina Distribution — réassort' },
    { type: 'ENTREE', quantite: 35,  productId: prods[5].id, fournisseurId: 7, note: 'Organica Group — huile argan' },
    { type: 'ENTREE', quantite: 50,  productId: prods[6].id, fournisseurId: 3, note: 'Bendemrane — Tanger' },
    { type: 'ENTREE', quantite: 40,  productId: prods[7].id, fournisseurId: 8, note: 'Gold Cosmetic Lab — monthly' },
  ];
  // Idempotency: skip if matching note already exists in last 30 days
  for (const m of mouvements) {
    const exists = await prisma.stockMovement.findFirst({ where: { note: m.note, productId: m.productId, type: m.type } });
    if (exists) continue;
    await prisma.$transaction([
      prisma.stockMovement.create({ data: m }),
      prisma.product.update({ where: { id: m.productId }, data: { stock: { increment: m.quantite } } }),
    ]);
  }
  console.log('✓ mouvements de stock enrichis');

  console.log('\n📋 Comptes de test :');
  console.log('  Public : client@pharmeon.ma / client');
  console.log('  Pro    : pro@pharmeon.ma / pro');
  console.log('  Admin  : défini dans .env (ADMIN_USERNAME / ADMIN_PASSWORD — défaut admin/admin)');
  console.log('  Extra  : para.dz@pharmeon.ma / demo1234 (PRO El Jadida)');
  console.log('           para.tetouan@pharmeon.ma / demo1234 (PRO Tétouan)');
  console.log('           fatima.bennani@mail.com / demo1234 (particulier)');
  console.log('           youssef.alami@mail.com / demo1234 (particulier)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
