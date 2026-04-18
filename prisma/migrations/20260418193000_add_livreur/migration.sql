CREATE TABLE IF NOT EXISTS "Livreur" (
  "id" SERIAL PRIMARY KEY,
  "nom" TEXT NOT NULL,
  "telephone" TEXT,
  "ville" TEXT,
  "vehicule" TEXT,
  "cin" TEXT,
  "note" TEXT,
  "actif" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "BonLivraison" ADD COLUMN IF NOT EXISTS "livreurId" INTEGER;

ALTER TABLE "BonLivraison" DROP CONSTRAINT IF EXISTS "BonLivraison_livreurId_fkey";
ALTER TABLE "BonLivraison"
  ADD CONSTRAINT "BonLivraison_livreurId_fkey"
  FOREIGN KEY ("livreurId") REFERENCES "Livreur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
