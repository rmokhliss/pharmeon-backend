-- Sync migration: capture all schema drift in a single idempotent migration.
-- Safe to run on DBs that already have some of these tables/columns (e.g. Railway prod).

-- ── Product: add pricing + image columns ──────────────────────────────────
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "cost_price" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "retail_price" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "wholesale_price" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "retail_discount_pct" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "wholesale_discount_pct" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "image_url" TEXT;

-- ── StockMovement: add source tracking + bon-commande link ────────────────
ALTER TABLE "StockMovement" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN IF NOT EXISTS "sourceId" INTEGER;
ALTER TABLE "StockMovement" ADD COLUMN IF NOT EXISTS "bonCommandeId" INTEGER;

-- ── CommandeItem: add pricing history ─────────────────────────────────────
ALTER TABLE "CommandeItem" ADD COLUMN IF NOT EXISTS "original_price" DOUBLE PRECISION;
ALTER TABLE "CommandeItem" ADD COLUMN IF NOT EXISTS "final_price" DOUBLE PRECISION;

-- ── DemandeAcces ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "DemandeAcces" (
    "id" SERIAL PRIMARY KEY,
    "categorie" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "email" TEXT NOT NULL,
    "contact" TEXT,
    "message" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── BonCommandeFournisseur ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "BonCommandeFournisseur" (
    "id" SERIAL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "fournisseurId" INTEGER NOT NULL,
    "note" TEXT,
    "expected_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "BonCommandeFournisseur_reference_key" ON "BonCommandeFournisseur"("reference");

-- ── BonCommandeFournisseurItem ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "BonCommandeFournisseurItem" (
    "id" SERIAL PRIMARY KEY,
    "bonId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_achat" DOUBLE PRECISION NOT NULL
);

-- ── BonLivraison ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "BonLivraison" (
    "id" SERIAL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "commandeId" INTEGER NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "tracking_number" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_PREPARATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "BonLivraison_reference_key" ON "BonLivraison"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "BonLivraison_commandeId_key" ON "BonLivraison"("commandeId");

-- ── Facture ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Facture" (
    "id" SERIAL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "commandeId" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "total_ht" DOUBLE PRECISION NOT NULL,
    "total_ttc" DOUBLE PRECISION NOT NULL,
    "issued_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Facture_reference_key" ON "Facture"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "Facture_commandeId_key" ON "Facture"("commandeId");

-- ── StockAdjustement ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "StockAdjustement" (
    "id" SERIAL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "StockAdjustement_reference_key" ON "StockAdjustement"("reference");

-- ── StockAdjustementItem ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "StockAdjustementItem" (
    "id" SERIAL PRIMARY KEY,
    "adjustementId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "cost_price" DOUBLE PRECISION NOT NULL
);

-- ── Foreign keys (add only if missing) ────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StockMovement_bonCommandeId_fkey') THEN
    ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_bonCommandeId_fkey"
      FOREIGN KEY ("bonCommandeId") REFERENCES "BonCommandeFournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BonCommandeFournisseur_fournisseurId_fkey') THEN
    ALTER TABLE "BonCommandeFournisseur" ADD CONSTRAINT "BonCommandeFournisseur_fournisseurId_fkey"
      FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BonCommandeFournisseurItem_bonId_fkey') THEN
    ALTER TABLE "BonCommandeFournisseurItem" ADD CONSTRAINT "BonCommandeFournisseurItem_bonId_fkey"
      FOREIGN KEY ("bonId") REFERENCES "BonCommandeFournisseur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BonCommandeFournisseurItem_productId_fkey') THEN
    ALTER TABLE "BonCommandeFournisseurItem" ADD CONSTRAINT "BonCommandeFournisseurItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BonLivraison_commandeId_fkey') THEN
    ALTER TABLE "BonLivraison" ADD CONSTRAINT "BonLivraison_commandeId_fkey"
      FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Facture_commandeId_fkey') THEN
    ALTER TABLE "Facture" ADD CONSTRAINT "Facture_commandeId_fkey"
      FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StockAdjustementItem_adjustementId_fkey') THEN
    ALTER TABLE "StockAdjustementItem" ADD CONSTRAINT "StockAdjustementItem_adjustementId_fkey"
      FOREIGN KEY ("adjustementId") REFERENCES "StockAdjustement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StockAdjustementItem_productId_fkey') THEN
    ALTER TABLE "StockAdjustementItem" ADD CONSTRAINT "StockAdjustementItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
