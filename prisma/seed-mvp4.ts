import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ── Clients avec accès portail ────────────────────────────────
  const hash = async (p: string) => bcrypt.hash(p, 10);

  await prisma.client.updateMany({ where: {}, data: {} }); // ping

  const clientsData = [
    { id: 1,  nom: 'Pharmacie Oussama',       type: 'PHARMACIE',   ville: 'Casablanca',  telephone: '+212 5 22 73 57 37', email: 'oussama.pharma@pharmeon.ma',    password: 'oussama2024'  },
    { id: 2,  nom: 'Pharmacie Centrale',       type: 'PHARMACIE',   ville: 'Marrakech',   telephone: '+212 5 24 43 01 58', email: 'centrale.marrakech@pharmeon.ma', password: 'centrale24'   },
    { id: 3,  nom: 'Pharmacie du Maghreb',     type: 'PHARMACIE',   ville: 'Benslimane',  telephone: '+212 5 23 29 66 33', email: 'maghreb.pharma@pharmeon.ma',    password: 'maghreb24'    },
    { id: 4,  nom: 'Pharmacie Atlas Al Kabir', type: 'PHARMACIE',   ville: 'Salé',        telephone: '+212 5 37 80 66 66', email: 'atlas.sale@pharmeon.ma',        password: 'atlas2024'    },
    { id: 5,  nom: 'Pharmacie Moulay El Kamel',type: 'PHARMACIE',   ville: 'Fès',         telephone: '+212 5 35 62 66 36', email: 'moulay.fes@pharmeon.ma',        password: 'moulay24'     },
    { id: 6,  nom: 'Pharmacie Al Qods',        type: 'PHARMACIE',   ville: 'Fès',         telephone: '+212 5 35 65 50 68', email: 'alqods.fes@pharmeon.ma',        password: 'alqods24'     },
    { id: 7,  nom: 'Pharmacie Populaire',      type: 'PHARMACIE',   ville: 'Marrakech',   telephone: '+212 5 24 38 22 93', email: 'populaire.marrakech@pharmeon.ma',password: 'populaire24' },
    { id: 8,  nom: 'Pharmacie Anza',           type: 'PHARMACIE',   ville: 'Agadir',      telephone: null,                 email: 'anza.agadir@pharmeon.ma',       password: 'anza2024'     },
    { id: 9,  nom: 'Yves Rocher Mers Sultan',  type: 'PARA',        ville: 'Casablanca',  telephone: '+212 5 22 26 67 10', email: 'yvesrocher.casa@pharmeon.ma',   password: 'rocher24'     },
    { id: 10, nom: 'Faces Casablanca',         type: 'PARA',        ville: 'Casablanca',  telephone: null,                 email: 'faces.casa@pharmeon.ma',        password: 'faces2024'    },
    { id: 11, nom: 'Nova Parapharmacie',        type: 'PARA',        ville: 'Casablanca',  telephone: null,                 email: 'nova.para@pharmeon.ma',         password: 'nova2024'     },
    { id: 12, nom: 'Argalista',                 type: 'PARA',        ville: 'Marrakech',   telephone: null,                 email: 'argalista.marrakech@pharmeon.ma',password: 'argalista24' },
  ];

  for (const c of clientsData) {
    const hashed = await hash(c.password);
    await prisma.client.upsert({
      where: { id: c.id },
      update: { email: c.email, password: hashed },
      create: {
        nom: c.nom, type: c.type, ville: c.ville,
        telephone: c.telephone ?? undefined,
        email: c.email, password: hashed,
      },
    });
  }

  // ── Fournisseurs ──────────────────────────────────────────────
  const fourn = [
    { id: 1, nom: 'Cooper Pharma',           ville: 'Casablanca', telephone: '+212 5 22 49 79 00', contact: 'Direction commerciale' },
    { id: 2, nom: 'Sothema',                 ville: 'Bouskoura',  telephone: '+212 5 22 43 70 40', contact: 'Direction commerciale' },
    { id: 3, nom: 'Bendemrane Distribution', ville: 'Tanger',     telephone: '+212 6 42 68 37 58', contact: 'M. Bendemrane'         },
    { id: 4, nom: 'Alina Distribution',      ville: 'Casablanca', telephone: '+212 5 22 35 98 01', contact: 'Service commercial'    },
    { id: 5, nom: 'NUXE Maroc',              ville: 'Casablanca', telephone: null,                  contact: 'Représentant NUXE'    },
    { id: 6, nom: 'La Roche-Posay Maroc',    ville: 'Casablanca', telephone: null,                  contact: "Délégué L'Oréal"      },
    { id: 7, nom: 'Organica Group',          ville: 'Marrakech',  telephone: null,                  contact: 'Direction export'     },
    { id: 8, nom: 'Gold Cosmetic Lab',       ville: 'Casablanca', telephone: '+212 5 22 66 10 20', contact: 'M. Rachidi'            },
  ];

  for (const f of fourn) {
    await prisma.fournisseur.upsert({
      where: { id: f.id },
      update: {},
      create: { nom: f.nom, ville: f.ville, telephone: f.telephone ?? undefined, contact: f.contact },
    });
  }

  // ── Produits — récupérer les 12 premiers ─────────────────────
  const products = await prisma.product.findMany({ take: 12, orderBy: { id: 'asc' } });
  if (!products.length) { console.log('⚠️  Aucun produit — lance le seed principal d\'abord'); return; }
  const p = (i: number) => products[i % products.length];

  // ── Mouvements de stock ───────────────────────────────────────
  const mouvements: { type: string; quantite: number; productId: number; clientId?: number; fournisseurId?: number; note: string }[] = [
    { type: 'ENTREE', quantite: 60, productId: p(0).id,  fournisseurId: 1, note: 'Livraison Cooper Pharma — lot avril'       },
    { type: 'ENTREE', quantite: 40, productId: p(1).id,  fournisseurId: 5, note: 'Réception NUXE Huile Prodigieuse'          },
    { type: 'ENTREE', quantite: 30, productId: p(2).id,  fournisseurId: 6, note: 'La Roche-Posay — commande mensuelle'       },
    { type: 'ENTREE', quantite: 50, productId: p(3).id,  fournisseurId: 4, note: 'Alina Distribution — réassort'             },
    { type: 'ENTREE', quantite: 35, productId: p(4).id,  fournisseurId: 2, note: 'Sothema — lot printemps'                   },
    { type: 'ENTREE', quantite: 25, productId: p(5).id,  fournisseurId: 7, note: 'Organica Group — huile argan bio'          },
    { type: 'ENTREE', quantite: 45, productId: p(6).id,  fournisseurId: 3, note: 'Bendemrane — livraison Tanger'             },
    { type: 'ENTREE', quantite: 55, productId: p(7).id,  fournisseurId: 8, note: 'Gold Cosmetic Lab — commande mensuelle'    },
    { type: 'ENTREE', quantite: 20, productId: p(8).id,  fournisseurId: 1, note: 'Cooper Pharma — réassort urgent'           },
    { type: 'ENTREE', quantite: 30, productId: p(9).id,  fournisseurId: 5, note: 'NUXE — nouvelle référence'                 },
    { type: 'SORTIE', quantite: 12, productId: p(0).id,  clientId: 1,  note: 'Pharmacie Oussama — commande hebdo'           },
    { type: 'SORTIE', quantite: 8,  productId: p(1).id,  clientId: 2,  note: 'Pharmacie Centrale Marrakech'                 },
    { type: 'SORTIE', quantite: 15, productId: p(2).id,  clientId: 9,  note: 'Yves Rocher Mers Sultan'                      },
    { type: 'SORTIE', quantite: 6,  productId: p(3).id,  clientId: 4,  note: 'Pharmacie Atlas Al Kabir'                     },
    { type: 'SORTIE', quantite: 10, productId: p(4).id,  clientId: 10, note: 'Faces Morocco Mall'                           },
    { type: 'SORTIE', quantite: 4,  productId: p(5).id,  clientId: 5,  note: 'Pharmacie Moulay El Kamel Fès'                },
    { type: 'SORTIE', quantite: 18, productId: p(6).id,  clientId: 11, note: 'Nova Parapharmacie'                           },
    { type: 'SORTIE', quantite: 9,  productId: p(7).id,  clientId: 3,  note: 'Pharmacie du Maghreb Benslimane'              },
    { type: 'SORTIE', quantite: 5,  productId: p(8).id,  clientId: 7,  note: 'Pharmacie Populaire Marrakech'                },
    { type: 'SORTIE', quantite: 11, productId: p(9).id,  clientId: 12, note: 'Argalista Marrakech'                          },
    { type: 'SORTIE', quantite: 7,  productId: p(10).id, clientId: 6,  note: 'Pharmacie Al Qods Fès'                        },
    { type: 'SORTIE', quantite: 3,  productId: p(11).id, clientId: 8,  note: 'Pharmacie Anza Agadir'                        },
  ];

  for (const m of mouvements) {
    const delta = m.type === 'ENTREE' ? m.quantite : -m.quantite;
    await prisma.$transaction([
      prisma.stockMovement.create({ data: m }),
      prisma.product.update({ where: { id: m.productId }, data: { stock: { increment: delta } } }),
    ]);
  }

  console.log(`✓ ${clientsData.length} clients (avec accès portail)`);
  console.log(`✓ ${fourn.length} fournisseurs`);
  console.log(`✓ ${mouvements.length} mouvements de stock`);
  console.log('\n📋 Exemples de connexion portail :');
  console.log('  Email : oussama.pharma@pharmeon.ma   | Mot de passe : oussama2024');
  console.log('  Email : centrale.marrakech@pharmeon.ma | Mot de passe : centrale24');
  console.log('  Email : yvesrocher.casa@pharmeon.ma  | Mot de passe : rocher24');
}

main().catch(console.error).finally(() => prisma.$disconnect());
