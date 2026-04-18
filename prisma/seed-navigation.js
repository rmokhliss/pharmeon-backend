// Seed navigation data: DemandeAcces, BonCommandeFournisseur, Commande (+ BL/Facture), StockAdjustement.
// Idempotent: skips tables that already have rows.
// Run: node prisma/seed-navigation.js  (uses DATABASE_URL from .env)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Pre-reqs from seed-full.js
  const clients = await prisma.client.findMany({ orderBy: { id: 'asc' } });
  const fournisseurs = await prisma.fournisseur.findMany({ orderBy: { id: 'asc' } });
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' }, take: 20 });
  if (!clients.length || !fournisseurs.length || !products.length) {
    console.log('⚠ Run seed-full.js first (need clients/fournisseurs/products)');
    process.exit(1);
  }

  // ── Demandes d'accès (pending) ───────────────────────────────
  if ((await prisma.demandeAcces.count()) === 0) {
    const demandes = [
      { categorie: 'PRO', nom: 'Pharmacie Lalla Yacout', type: 'PHARMACIE', ville: 'Casablanca', telephone: '+212 5 22 31 45 67', email: 'lalla.yacout@example.ma', contact: 'M. Benani', message: 'Demande de compte grossiste pour pharmacie à Casa.' },
      { categorie: 'PRO', nom: 'Parapharmacie Agdal', type: 'PARA', ville: 'Rabat', telephone: '+212 5 37 67 12 34', email: 'contact@para-agdal.ma', message: 'Souhaitons accès grossiste.' },
      { categorie: 'CLIENT_PUBLIC', nom: 'Ahmed Tazi', ville: 'Casablanca', telephone: '+212 6 12 34 56 78', email: 'ahmed.tazi@mail.com', message: 'Commande personnelle.' },
      { categorie: 'FOURNISSEUR', nom: 'LabPhyto Maroc', ville: 'Casablanca', email: 'commercial@labphyto.ma', contact: 'Direction export', message: 'Proposition partenariat distribution.' },
    ];
    for (const d of demandes) await prisma.demandeAcces.create({ data: d });
    console.log(`✓ ${demandes.length} demandes d'accès`);
  } else console.log('  (demandes déjà présentes)');

  // ── Bons de Commande Fournisseur (PO) ────────────────────────
  if ((await prisma.bonCommandeFournisseur.count()) === 0) {
    const pos = [
      { reference: `PO-${Date.now()}-1`, statut: 'BROUILLON', fournisseurId: fournisseurs[0].id, note: 'Commande trimestrielle Cooper Pharma', items: [{ productId: products[0].id, quantite: 50, prix_achat: products[0].prix_achat }, { productId: products[1].id, quantite: 30, prix_achat: products[1].prix_achat }] },
      { reference: `PO-${Date.now()}-2`, statut: 'ENVOYEE', fournisseurId: fournisseurs[1].id, expected_date: new Date(Date.now() + 7 * 864e5), note: 'Sothema — réassort mensuel', items: [{ productId: products[2].id, quantite: 40, prix_achat: products[2].prix_achat }, { productId: products[3].id, quantite: 25, prix_achat: products[3].prix_achat }] },
      { reference: `PO-${Date.now()}-3`, statut: 'LIVREE', fournisseurId: fournisseurs[4].id, expected_date: new Date(Date.now() - 2 * 864e5), note: 'NUXE — livré la semaine dernière', items: [{ productId: products[4].id, quantite: 20, prix_achat: products[4].prix_achat }, { productId: products[5].id, quantite: 15, prix_achat: products[5].prix_achat }] },
    ];
    for (const po of pos) {
      const { items, ...rest } = po;
      const created = await prisma.bonCommandeFournisseur.create({ data: { ...rest, items: { create: items } } });
      if (po.statut === 'LIVREE') {
        for (const it of items) {
          await prisma.$transaction([
            prisma.stockMovement.create({ data: { type: 'ENTREE', quantite: it.quantite, productId: it.productId, fournisseurId: po.fournisseurId, bonCommandeId: created.id, source: 'PO', sourceId: created.id, note: `PO ${created.reference}` } }),
            prisma.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantite } } }),
          ]);
        }
      }
    }
    console.log(`✓ ${pos.length} bons de commande fournisseur`);
  } else console.log('  (PO fournisseur déjà présents)');

  // ── Commandes client (avec BL + Facture pour LIVREE) ─────────
  if ((await prisma.commande.count()) === 0) {
    const withPass = clients.filter((c) => c.password);
    const mkItems = (prodIdx, role) => prodIdx.map((i) => {
      const p = products[i];
      const retail = p.retail_price ?? p.prix_vente;
      const wholesale = p.wholesale_price || retail;
      const base = role === 'PRO' ? wholesale : retail;
      const disc = role === 'PRO' ? (p.wholesale_discount_pct || 0) : (p.retail_discount_pct || 0);
      const final = Math.round(base * (1 - disc / 100) * 100) / 100;
      return { productId: p.id, quantite: Math.ceil(Math.random() * 5) + 1, prixUnitaire: final, original_price: final, final_price: final };
    });

    const commandes = [
      { clientIdx: 0, statut: 'EN_ATTENTE', items: mkItems([0, 1, 2], 'PRO'), note: 'Commande urgente — livraison cette semaine' },
      { clientIdx: 1, statut: 'VALIDEE', items: mkItems([3, 4], 'PRO') },
      { clientIdx: 2, statut: 'EN_COURS', items: mkItems([5, 6, 7, 8], 'PRO') },
      { clientIdx: 8, statut: 'LIVREE', items: mkItems([9, 10], 'PRO'), tracking: 'AMANA-AX2026-4021' },
    ];
    for (let i = 0; i < commandes.length; i++) {
      const c = commandes[i];
      const client = withPass[c.clientIdx] ?? clients[c.clientIdx];
      const ref = `CMD-${Date.now()}-${i}`;
      const created = await prisma.commande.create({ data: { reference: ref, clientId: client.id, note: c.note ?? null, statut: c.statut === 'LIVREE' ? 'EN_ATTENTE' : c.statut, items: { create: c.items } } });
      if (c.statut === 'LIVREE') {
        const totalHT = c.items.reduce((s, it) => s + it.final_price * it.quantite, 0);
        for (const it of c.items) {
          await prisma.$transaction([
            prisma.stockMovement.create({ data: { type: 'SORTIE', quantite: it.quantite, productId: it.productId, clientId: client.id, source: 'COMMANDE', sourceId: created.id, note: `Commande ${ref}` } }),
            prisma.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantite } } }),
          ]);
        }
        await prisma.bonLivraison.create({ data: { reference: `BL-${Date.now()}-${i}`, commandeId: created.id, tracking_number: c.tracking, delivery_date: new Date(), statut: 'LIVRE' } });
        await prisma.facture.create({ data: { reference: `FAC-${Date.now()}-${i}`, commandeId: created.id, total_ht: Math.round(totalHT * 100) / 100, total_ttc: Math.round(totalHT * 1.2 * 100) / 100, statut: 'EMISE', issued_at: new Date() } });
        await prisma.commande.update({ where: { id: created.id }, data: { statut: 'LIVREE' } });
      }
    }
    console.log(`✓ ${commandes.length} commandes client (dont 1 LIVREE avec BL + Facture)`);
  } else console.log('  (commandes déjà présentes)');

  // ── Bons d'ajustement stock ──────────────────────────────────
  if ((await prisma.stockAdjustement.count()) === 0 && (await prisma.product.count()) > 5) {
    const adj1 = await prisma.stockAdjustement.create({
      data: { reference: `ADJ-${Date.now()}-1`, type: 'EXPIRATION', statut: 'EN_ATTENTE', note: 'Lot périmé fin mars 2026', items: { create: [{ productId: products[2].id, quantite: 3, cost_price: products[2].prix_achat }, { productId: products[5].id, quantite: 2, cost_price: products[5].prix_achat }] } },
    });
    const adj2 = await prisma.stockAdjustement.create({
      data: { reference: `ADJ-${Date.now()}-2`, type: 'CASSE', statut: 'VALIDEE', note: 'Chute en stockage — produits cassés', items: { create: [{ productId: products[7].id, quantite: 2, cost_price: products[7].prix_achat }] } },
    });
    // Apply stock effect of VALIDEE adjustment
    await prisma.$transaction([
      prisma.stockMovement.create({ data: { type: 'SORTIE', quantite: 2, productId: products[7].id, source: 'ADJUSTMENT', sourceId: adj2.id, note: `Ajustement ${adj2.reference} (CASSE)` } }),
      prisma.product.update({ where: { id: products[7].id }, data: { stock: { decrement: 2 } } }),
    ]);
    console.log('✓ 2 bons d\'ajustement (1 EN_ATTENTE EXPIRATION, 1 VALIDEE CASSE)');
  } else console.log('  (ajustements déjà présents)');

  console.log('\n🎉 Données de navigation prêtes.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
