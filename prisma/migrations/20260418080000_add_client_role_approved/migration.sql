-- Add role and approved columns to Client
ALTER TABLE "Client" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'CLIENT_PUBLIC';
ALTER TABLE "Client" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;
