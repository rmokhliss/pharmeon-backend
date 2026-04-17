// Full seed — plain JS, no TypeScript, runs directly with node
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const products = [
  { reference:"VIS-001", nom:"KUORA Ampoule Flash Effet Lifting Immédiat 2 Ampoules", marque:"KUORA", categorie:"Visage", prix_achat:62.25, prix_vente:83.00, unite:"Pièce" },
  { reference:"VIS-002", nom:"ISDIN Protector Labial SPF 50+", marque:"ISDIN", categorie:"Visage", prix_achat:63.11, prix_vente:84.15, unite:"Pièce" },
  { reference:"VIS-003", nom:"CERAVE Crème Réparatrice Contour Yeux 14ml", marque:"CERAVE", categorie:"Visage", prix_achat:76.77, prix_vente:102.36, unite:"Pièce" },
  { reference:"VIS-004", nom:"EUCERIN Sun Fluide Pigment Control SPF 50 50ml", marque:"EUCERIN", categorie:"Visage", prix_achat:155.18, prix_vente:206.91, unite:"Pièce" },
  { reference:"VIS-005", nom:"EUCERIN Hyaluron Filler 3 Effects Soin de Nuit 50ml", marque:"EUCERIN", categorie:"Visage", prix_achat:240.57, prix_vente:320.76, unite:"Pièce" },
  { reference:"VIS-006", nom:"LA ROCHE POSAY Cicaplast Baume Réparateur B5+ 100ml", marque:"LA ROCHE POSAY", categorie:"Visage", prix_achat:137.86, prix_vente:183.81, unite:"Pièce" },
  { reference:"VIS-007", nom:"CERAVE Sérum Resurfaçant au Rétinol 30ml", marque:"CERAVE", categorie:"Visage", prix_achat:131.47, prix_vente:175.29, unite:"Pièce" },
  { reference:"VIS-008", nom:"SOMEBYMI Retinol Intense Crème Yeux Triple Action 30ml", marque:"SOMEBYMI", categorie:"Visage", prix_achat:202.50, prix_vente:270.00, unite:"Pièce" },
  { reference:"VIS-009", nom:"ISDIN Protector Labial SPF 30", marque:"ISDIN", categorie:"Visage", prix_achat:55.69, prix_vente:74.25, unite:"Pièce" },
  { reference:"VIS-010", nom:"JAYJUN Pollution Proof Luminous Mask 27ml", marque:"JAYJUN", categorie:"Visage", prix_achat:26.25, prix_vente:35.00, unite:"Pièce" },
  { reference:"CHV-001", nom:"L'Oreal Professionnel Absolut Repair Molecular Masque 100ml", marque:"L'OREAL PROFESSIONNEL", categorie:"Cheveux", prix_achat:149.25, prix_vente:199.00, unite:"Pièce" },
  { reference:"CHV-002", nom:"ODARYM Gel de Lin Fixateur Naturel 100ml", marque:"ODARYM", categorie:"Cheveux", prix_achat:45.00, prix_vente:60.00, unite:"Pièce" },
  { reference:"CHV-003", nom:"Bjorn Axen Spray Mega Fixe Super Strong Hold 250ml", marque:"BJORN AXEN", categorie:"Cheveux", prix_achat:157.41, prix_vente:209.88, unite:"Pièce" },
  { reference:"CHV-004", nom:"Biokap Nutricolor 6.0 Blond Tabac", marque:"BIOKAP", categorie:"Cheveux", prix_achat:118.80, prix_vente:158.40, unite:"Pièce" },
  { reference:"CHV-005", nom:"L'Oreal Professionnel Absolut Repair Shampooing 500ml", marque:"L'OREAL PROFESSIONNEL", categorie:"Cheveux", prix_achat:153.75, prix_vente:205.00, unite:"Pièce" },
  { reference:"CHV-006", nom:"L'Oreal Professionnel Absolut Repair Shampooing 300ml", marque:"L'OREAL PROFESSIONNEL", categorie:"Cheveux", prix_achat:110.25, prix_vente:147.00, unite:"Pièce" },
  { reference:"CHV-007", nom:"Olaplex Bond Maintenance N°5 Après-Shampooing 250ml", marque:"OLAPLEX", categorie:"Cheveux", prix_achat:224.44, prix_vente:299.25, unite:"Pièce" },
  { reference:"CHV-008", nom:"Nuxe Sun Huile Lactée Capillaire 100ml", marque:"NUXE", categorie:"Cheveux", prix_achat:163.35, prix_vente:217.80, unite:"Pièce" },
  { reference:"CHV-009", nom:"Vichy Dercos Shampooing Anti Pelliculaire 200ml", marque:"VICHY", categorie:"Cheveux", prix_achat:101.55, prix_vente:135.40, unite:"Pièce" },
  { reference:"CHV-010", nom:"Klorane Lait d'Avoine Shampooing Sec 150ml", marque:"KLORANE", categorie:"Cheveux", prix_achat:83.54, prix_vente:111.39, unite:"Pièce" },
  { reference:"CRP-001", nom:"CERAVE Huile Lavante Moussante Hydratante 236ml", marque:"CERAVE", categorie:"Corps", prix_achat:80.14, prix_vente:106.85, unite:"Pièce" },
  { reference:"CRP-002", nom:"VICHY Déodorant Anti Transpirant 48H Spray 125ml", marque:"VICHY", categorie:"Corps", prix_achat:89.67, prix_vente:119.56, unite:"Pièce" },
  { reference:"CRP-003", nom:"VICHY Crème Dépilatoire 150ml", marque:"VICHY", categorie:"Corps", prix_achat:109.36, prix_vente:145.81, unite:"Pièce" },
  { reference:"CRP-004", nom:"ISDIN Ureadin Ultra 30 Exfoliating Crème 50ml", marque:"ISDIN", categorie:"Corps", prix_achat:155.93, prix_vente:207.90, unite:"Pièce" },
  { reference:"CRP-005", nom:"NUXE Sun Eau Délicieuse Parfumante 100ml", marque:"NUXE", categorie:"Corps", prix_achat:289.58, prix_vente:386.10, unite:"Pièce" },
  { reference:"SOL-001", nom:"NUXE Sun Lait Solaire Fondant SPF 30", marque:"NUXE", categorie:"Solaire", prix_achat:215.33, prix_vente:287.10, unite:"Pièce" },
  { reference:"SOL-002", nom:"EUCERIN Oil Sun Protect Control Dry Touch", marque:"EUCERIN", categorie:"Solaire", prix_achat:147.76, prix_vente:197.01, unite:"Pièce" },
  { reference:"SOL-003", nom:"ISDIN Fotoprotector Pediatrics Transparent Spray SPF50 250ml", marque:"ISDIN", categorie:"Solaire", prix_achat:193.05, prix_vente:257.40, unite:"Pièce" },
  { reference:"MAQ-001", nom:"MUA Intense Couleur Crayon Yeux", marque:"MUA MAKEUP ACADEMY", categorie:"Maquillage", prix_achat:26.25, prix_vente:35.00, unite:"Pièce" },
  { reference:"MAQ-002", nom:"MUA Blushed Blush Liquide", marque:"MUA MAKEUP ACADEMY", categorie:"Maquillage", prix_achat:41.25, prix_vente:55.00, unite:"Pièce" },
  { reference:"MAQ-003", nom:"Maybelline Brillant à Lèvres Superstay Vinyl Ink", marque:"MAYBELLINE", categorie:"Maquillage", prix_achat:82.97, prix_vente:110.63, unite:"Pièce" },
  { reference:"MAQ-004", nom:"Maybelline Fit Me Matte+ Poreless SPF 22", marque:"MAYBELLINE", categorie:"Maquillage", prix_achat:72.00, prix_vente:96.00, unite:"Pièce" },
  { reference:"BBY-001", nom:"GILBERT Liniderm Liniment Oléo Calcaire 250ml", marque:"GILBERT", categorie:"Bébé & Maman", prix_achat:47.52, prix_vente:63.36, unite:"Pièce" },
  { reference:"BBY-002", nom:"WATERWIPES Lingettes Bébé Pack 4x60", marque:"WATERWIPES", categorie:"Bébé & Maman", prix_achat:162.86, prix_vente:217.14, unite:"Pièce" },
  { reference:"BDT-001", nom:"NEOPULSE Tête de Brosse à Dents", marque:"NEOPULSE", categorie:"Bucco-Dentaire", prix_achat:175.23, prix_vente:233.64, unite:"Pièce" },
  { reference:"BDT-002", nom:"ELGYDIUM Baby Brosse à Dents", marque:"ELGYDIUM", categorie:"Bucco-Dentaire", prix_achat:34.52, prix_vente:46.02, unite:"Pièce" },
  { reference:"BDT-003", nom:"ELGYDIUM Dentifrice Enfant", marque:"ELGYDIUM", categorie:"Bucco-Dentaire", prix_achat:33.02, prix_vente:44.02, unite:"Pièce" },
  { reference:"BDT-006", nom:"VITIS Whitening Dentifrice Blancheur", marque:"VITIS", categorie:"Bucco-Dentaire", prix_achat:49.01, prix_vente:65.34, unite:"Pièce" },
  { reference:"BDT-007", nom:"GUM Sensitive Gums Dentifrice", marque:"GUM", categorie:"Bucco-Dentaire", prix_achat:48.11, prix_vente:64.15, unite:"Pièce" },
];

async function main() {
  // Products
  for (const p of products) {
    await prisma.product.upsert({ where: { reference: p.reference }, update: {}, create: { ...p, stock: 0, stock_min: 5 } });
  }
  console.log(`✓ ${products.length} produits`);

  // Fournisseurs
  const fourn = [
    { nom:'Cooper Pharma', ville:'Casablanca', telephone:'+212 5 22 49 79 00', contact:'Direction commerciale' },
    { nom:'Sothema', ville:'Bouskoura', telephone:'+212 5 22 43 70 40', contact:'Direction commerciale' },
    { nom:'Bendemrane Distribution', ville:'Tanger', telephone:'+212 6 42 68 37 58', contact:'M. Bendemrane' },
    { nom:'Alina Distribution', ville:'Casablanca', telephone:'+212 5 22 35 98 01', contact:'Service commercial' },
    { nom:'NUXE Maroc', ville:'Casablanca', contact:'Représentant NUXE' },
    { nom:'La Roche-Posay Maroc', ville:'Casablanca', contact:"Délégué L'Oréal" },
    { nom:'Organica Group', ville:'Marrakech', contact:'Direction export' },
    { nom:'Gold Cosmetic Lab', ville:'Casablanca', telephone:'+212 5 22 66 10 20', contact:'M. Rachidi' },
  ];
  const fournisseurs = [];
  for (const f of fourn) {
    const existing = await prisma.fournisseur.findFirst({ where: { nom: f.nom } });
    const rec = existing ?? await prisma.fournisseur.create({ data: f });
    fournisseurs.push(rec);
  }
  console.log(`✓ ${fournisseurs.length} fournisseurs`);

  // Clients avec portail
  const clientsData = [
    { nom:'Pharmacie Oussama', type:'PHARMACIE', ville:'Casablanca', telephone:'+212 5 22 73 57 37', email:'oussama.pharma@pharmeon.ma', password:'oussama2024' },
    { nom:'Pharmacie Centrale', type:'PHARMACIE', ville:'Marrakech', telephone:'+212 5 24 43 01 58', email:'centrale.marrakech@pharmeon.ma', password:'centrale24' },
    { nom:'Pharmacie du Maghreb', type:'PHARMACIE', ville:'Benslimane', telephone:'+212 5 23 29 66 33', email:'maghreb.pharma@pharmeon.ma', password:'maghreb24' },
    { nom:'Pharmacie Atlas Al Kabir', type:'PHARMACIE', ville:'Salé', telephone:'+212 5 37 80 66 66', email:'atlas.sale@pharmeon.ma', password:'atlas2024' },
    { nom:'Pharmacie Moulay El Kamel', type:'PHARMACIE', ville:'Fès', telephone:'+212 5 35 62 66 36', email:'moulay.fes@pharmeon.ma', password:'moulay24' },
    { nom:'Pharmacie Al Qods', type:'PHARMACIE', ville:'Fès', telephone:'+212 5 35 65 50 68', email:'alqods.fes@pharmeon.ma', password:'alqods24' },
    { nom:'Pharmacie Populaire', type:'PHARMACIE', ville:'Marrakech', telephone:'+212 5 24 38 22 93', email:'populaire.marrakech@pharmeon.ma', password:'populaire24' },
    { nom:'Pharmacie Anza', type:'PHARMACIE', ville:'Agadir', email:'anza.agadir@pharmeon.ma', password:'anza2024' },
    { nom:'Yves Rocher Mers Sultan', type:'PARA', ville:'Casablanca', telephone:'+212 5 22 26 67 10', email:'yvesrocher.casa@pharmeon.ma', password:'rocher24' },
    { nom:'Faces Casablanca', type:'PARA', ville:'Casablanca', email:'faces.casa@pharmeon.ma', password:'faces2024' },
    { nom:'Nova Parapharmacie', type:'PARA', ville:'Casablanca', email:'nova.para@pharmeon.ma', password:'nova2024' },
    { nom:'Argalista', type:'PARA', ville:'Marrakech', email:'argalista.marrakech@pharmeon.ma', password:'argalista24' },
  ];
  const clients = [];
  for (const c of clientsData) {
    const hashed = await bcrypt.hash(c.password, 10);
    const { password, ...rest } = c;
    const rec = await prisma.client.upsert({
      where: { email: c.email },
      update: { password: hashed },
      create: { ...rest, password: hashed },
    });
    clients.push(rec);
  }
  console.log(`✓ ${clients.length} clients (portail actif)`);

  // Stock movements
  const prods = await prisma.product.findMany({ take: 12, orderBy: { id:'asc' } });
  const p = i => prods[i % prods.length];
  const mvts = [
    { type:'ENTREE', quantite:60, productId:p(0).id, fournisseurId:fournisseurs[0].id, note:'Livraison Cooper Pharma — lot avril' },
    { type:'ENTREE', quantite:40, productId:p(1).id, fournisseurId:fournisseurs[4].id, note:'Réception NUXE Huile Prodigieuse' },
    { type:'ENTREE', quantite:30, productId:p(2).id, fournisseurId:fournisseurs[5].id, note:'La Roche-Posay — commande mensuelle' },
    { type:'ENTREE', quantite:50, productId:p(3).id, fournisseurId:fournisseurs[3].id, note:'Alina Distribution — réassort' },
    { type:'ENTREE', quantite:35, productId:p(4).id, fournisseurId:fournisseurs[1].id, note:'Sothema — lot printemps' },
    { type:'ENTREE', quantite:25, productId:p(5).id, fournisseurId:fournisseurs[6].id, note:'Organica Group — huile argan bio' },
    { type:'ENTREE', quantite:45, productId:p(6).id, fournisseurId:fournisseurs[2].id, note:'Bendemrane — livraison Tanger' },
    { type:'ENTREE', quantite:55, productId:p(7).id, fournisseurId:fournisseurs[7].id, note:'Gold Cosmetic Lab — commande mensuelle' },
    { type:'ENTREE', quantite:20, productId:p(8).id, fournisseurId:fournisseurs[0].id, note:'Cooper Pharma — réassort urgent' },
    { type:'ENTREE', quantite:30, productId:p(9).id, fournisseurId:fournisseurs[4].id, note:'NUXE — nouvelle référence' },
    { type:'SORTIE', quantite:12, productId:p(0).id, clientId:clients[0].id, note:'Pharmacie Oussama — commande hebdo' },
    { type:'SORTIE', quantite:8,  productId:p(1).id, clientId:clients[1].id, note:'Pharmacie Centrale Marrakech' },
    { type:'SORTIE', quantite:15, productId:p(2).id, clientId:clients[8].id, note:'Yves Rocher Mers Sultan' },
    { type:'SORTIE', quantite:6,  productId:p(3).id, clientId:clients[3].id, note:'Pharmacie Atlas Al Kabir' },
    { type:'SORTIE', quantite:10, productId:p(4).id, clientId:clients[9].id, note:'Faces Morocco Mall' },
    { type:'SORTIE', quantite:4,  productId:p(5).id, clientId:clients[4].id, note:'Pharmacie Moulay El Kamel' },
    { type:'SORTIE', quantite:18, productId:p(6).id, clientId:clients[10].id, note:'Nova Parapharmacie' },
    { type:'SORTIE', quantite:9,  productId:p(7).id, clientId:clients[2].id, note:'Pharmacie du Maghreb' },
    { type:'SORTIE', quantite:5,  productId:p(8).id, clientId:clients[6].id, note:'Pharmacie Populaire Marrakech' },
    { type:'SORTIE', quantite:11, productId:p(9).id, clientId:clients[11].id, note:'Argalista Marrakech' },
    { type:'SORTIE', quantite:7,  productId:p(10).id, clientId:clients[5].id, note:'Pharmacie Al Qods Fès' },
    { type:'SORTIE', quantite:3,  productId:p(11).id, clientId:clients[7].id, note:'Pharmacie Anza Agadir' },
  ];
  const existingMvts = await prisma.stockMovement.count();
  if (existingMvts === 0) {
    for (const m of mvts) {
      const delta = m.type === 'ENTREE' ? m.quantite : -m.quantite;
      await prisma.$transaction([
        prisma.stockMovement.create({ data: m }),
        prisma.product.update({ where:{ id: m.productId }, data:{ stock:{ increment: delta } } }),
      ]);
    }
  } else {
    console.log(`  (mouvements déjà présents, ignorés)`);
  }
  console.log(`✓ ${mvts.length} mouvements de stock`);

  console.log('\n📋 Accès portail prêts à l\'emploi :');
  console.log('  Email : oussama.pharma@pharmeon.ma      | MDP : oussama2024');
  console.log('  Email : centrale.marrakech@pharmeon.ma  | MDP : centrale24');
  console.log('  Email : yvesrocher.casa@pharmeon.ma     | MDP : rocher24');
  console.log('  Email : nova.para@pharmeon.ma           | MDP : nova2024');
}

main().catch(console.error).finally(() => prisma.$disconnect());
