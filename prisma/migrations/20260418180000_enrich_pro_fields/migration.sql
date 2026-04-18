-- Enrich Client, Fournisseur, DemandeAcces with professional fields.
-- All columns are optional TEXT — safe to add on populated tables.

ALTER TABLE "Client"
  ADD COLUMN IF NOT EXISTS "code_postal"  TEXT,
  ADD COLUMN IF NOT EXISTS "contact_nom"  TEXT,
  ADD COLUMN IF NOT EXISTS "ice"          TEXT,
  ADD COLUMN IF NOT EXISTS "patente"      TEXT,
  ADD COLUMN IF NOT EXISTS "rc"           TEXT,
  ADD COLUMN IF NOT EXISTS "site_web"     TEXT;

ALTER TABLE "Fournisseur"
  ADD COLUMN IF NOT EXISTS "email"        TEXT,
  ADD COLUMN IF NOT EXISTS "code_postal"  TEXT,
  ADD COLUMN IF NOT EXISTS "adresse"      TEXT,
  ADD COLUMN IF NOT EXISTS "ice"          TEXT,
  ADD COLUMN IF NOT EXISTS "patente"      TEXT,
  ADD COLUMN IF NOT EXISTS "rc"           TEXT,
  ADD COLUMN IF NOT EXISTS "site_web"     TEXT;

ALTER TABLE "DemandeAcces"
  ADD COLUMN IF NOT EXISTS "code_postal"  TEXT,
  ADD COLUMN IF NOT EXISTS "adresse"      TEXT,
  ADD COLUMN IF NOT EXISTS "ice"          TEXT,
  ADD COLUMN IF NOT EXISTS "patente"      TEXT,
  ADD COLUMN IF NOT EXISTS "rc"           TEXT,
  ADD COLUMN IF NOT EXISTS "site_web"     TEXT;
