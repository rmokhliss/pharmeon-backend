# Pharmeon Backend — CLAUDE.md

## Stack
- **Framework:** NestJS 11 (TypeScript)
- **ORM:** Prisma 5 + PostgreSQL
- **Auth:** JWT (7d expiry) + bcrypt, Passport.js
- **Validation:** class-validator + class-transformer

## Architecture

```
src/
├── auth/               # JWT auth, RBAC guards/decorators
├── analytics/          # Profitability & reporting (ADMIN only)
├── adjustments/        # Stock adjustment vouchers (ADMIN only)
├── clients/            # Client management + registration
├── commandes/          # Customer orders
├── delivery-notes/     # Bons de Livraison (auto-created on LIVREE)
├── demandes/           # Access requests (public form)
├── fournisseurs/       # Supplier management
├── invoices/           # Factures (auto-created on LIVREE)
├── products/           # Product catalog + role-based pricing
├── purchase-orders/    # Bons de Commande Fournisseur (ADMIN only)
├── stock/              # Stock movement history
├── prisma.service.ts   # Prisma client wrapper
└── app.module.ts       # Root module
```

## Roles (ACL)

Three roles stored on the `Client.role` field:

| Role | Description | Access |
|------|-------------|--------|
| `ADMIN` | Full system access | All endpoints + cost_price + analytics |
| `PRO` | Pharmacie/Parapharmacy | Wholesale prices after `approved=true` |
| `CLIENT_PUBLIC` | Individual customer | Retail prices, immediate access |

### Guards
- `JwtAuthGuard` — requires valid JWT
- `RolesGuard` — requires specific role (use with `@Roles('ADMIN')`)
- `OptionalJwtAuthGuard` — populates user if token present, never throws

### Decorators
- `@Roles('ADMIN', 'PRO')` — restrict endpoint to listed roles

## Pricing Logic

Product has 5 price fields:
- `cost_price` — purchase cost from supplier (ADMIN only, **NEVER** exposed to others)
- `retail_price` — public selling price (CLIENT_PUBLIC)
- `wholesale_price` — professional selling price (PRO)
- `retail_discount_pct` — % discount on retail
- `wholesale_discount_pct` — % discount on wholesale

Backward-compat fields still present: `prix_achat`, `prix_vente`.

Effective price = `price * (1 - discount_pct / 100)`

`filterPriceByRole()` in `products.service.ts` strips sensitive fields by role.

## Closed Stock Flow — CRITICAL

**Stock is NEVER manually modified.**

| Movement | Trigger |
|----------|---------|
| ENTREE | BonCommandeFournisseur status → `LIVREE` |
| SORTIE | Commande status → `LIVREE` |
| Exceptional | StockAdjustement validated by ADMIN |

All StockMovements have `source` (COMMANDE/PO/ADJUSTMENT) and `sourceId` for full traceability.

Direct `POST /stock` endpoint is ADMIN-only and restricted to AJUSTEMENT type.

## Document Lifecycle

```
Customer Order:
EN_ATTENTE → VALIDEE → EN_COURS → LIVREE ──→ BonLivraison (auto) + Facture (auto)
                                          └→ Stock decremented

Supplier PO:
BROUILLON → ENVOYEE → CONFIRMEE → LIVREE ──→ Stock incremented
```

## Key Conventions

- All modules: `module.ts`, `service.ts`, `controller.ts` in `src/<feature>/`
- PrismaService injected via constructor in each service
- Admin-only endpoints: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')`
- References auto-generated: CMD/BL/FAC/PO/ADJ-timestamp
- TVA: 20% — `total_ttc = total_ht * 1.2`
- Soft delete only: `actif: false`, never hard delete

## Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=pharmeon-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

## Database

```bash
npx prisma migrate dev --name <description>   # create + apply migration
npx prisma generate                            # regenerate client after schema change
npx prisma db seed                             # seed data
```

## API Summary

| Module | Endpoint | Auth |
|--------|----------|------|
| Auth | POST /auth/login | public |
| Auth | POST /auth/admin/login | public |
| Auth | GET /auth/me | JWT |
| Products | GET /products | optional JWT (role-aware) |
| Products | POST/PUT/DELETE /products | ADMIN |
| Commandes | POST /commandes | JWT (PRO/CLIENT_PUBLIC) |
| Commandes | PATCH /commandes/:id/statut | ADMIN |
| Commandes | PATCH /commandes/:id/items/:itemId/price | ADMIN |
| Purchase Orders | * /purchase-orders | ADMIN |
| Delivery Notes | GET/PATCH /delivery-notes | ADMIN |
| Invoices | GET /invoices | ADMIN |
| Adjustments | * /adjustments | ADMIN |
| Analytics | GET /analytics/* | ADMIN |
