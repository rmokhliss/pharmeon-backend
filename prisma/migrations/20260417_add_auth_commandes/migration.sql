-- Add email and password to Client
ALTER TABLE "Client" ADD COLUMN "email" TEXT;
ALTER TABLE "Client" ADD COLUMN "password" TEXT;
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- Create Commande
CREATE TABLE "Commande" (
    "id" SERIAL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "note" TEXT,
    "clientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Commande_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Commande_reference_key" ON "Commande"("reference");

-- Create CommandeItem
CREATE TABLE "CommandeItem" (
    "id" SERIAL PRIMARY KEY,
    "commandeId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "CommandeItem_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommandeItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
