-- Add audience column on Product (PUBLIC / PRO / BOTH). Default BOTH keeps existing rows visible everywhere.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "audience" TEXT NOT NULL DEFAULT 'BOTH';
