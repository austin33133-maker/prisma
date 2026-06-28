# NOVAshop — Standalone E-commerce Site

A dynamic e-commerce **standalone site (独立站)** built with **Next.js 15 + Prisma + SQLite + Tailwind CSS**.

Browse products, filter by category, add to cart, and place real orders that are
persisted to a database with server-side price/stock validation.

See [`DESIGN.md`](./DESIGN.md) for the full design document.

## Features

- 🏬 Storefront: hero, category grid, featured products
- 🔎 Product catalogue with category filtering and detail pages
- 🛒 Cart with quantity control, persisted in `localStorage`
- 💳 Checkout that creates orders in the DB (price + stock validated server-side)
- ✅ Order confirmation page rendered from the database
- 🎨 Responsive UI with Tailwind CSS

## Tech stack

Next.js (App Router) · React 19 · Prisma · SQLite (`better-sqlite3` driver
adapter) · Tailwind CSS · TypeScript.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Generate the Prisma client, create the SQLite DB, and seed sample data
npm run setup

# 3. Start the dev server
npm run dev
# open http://localhost:3000
```

`npm run setup` runs `prisma generate` + `prisma db push` + the seed script.
If you only want to (re)seed: `npm run db:seed`. To wipe and reseed:
`npm run db:reset`.

## Scripts

| Script             | Description                                   |
|--------------------|-----------------------------------------------|
| `npm run dev`      | Start the Next.js dev server                  |
| `npm run build`    | `prisma generate` + production build          |
| `npm run start`    | Start the production server                   |
| `npm run setup`    | Generate client + push schema + seed          |
| `npm run db:seed`  | Seed sample categories and products           |
| `npm run db:reset` | Reset the DB and reseed                        |

## Configuration

The SQLite database lives at `prisma/dev.db`. Connection is configured via
`DATABASE_URL` in `.env`:

```
DATABASE_URL="file:./dev.db"
```

To switch to PostgreSQL/MySQL, change the `datasource` in
`prisma/schema.prisma`, swap the driver adapter in `src/lib/prisma.ts`, and
re-run `npm run setup`.

## Project structure

```
src/
├── app/             # routes: home, products, cart, order, api/orders
├── components/      # navbar, cart provider, product card, footer, …
└── lib/             # prisma client, queries, price formatting
prisma/
├── schema.prisma    # data model
└── seed.ts          # sample data
```

> Note: this project is self-contained and independent of the surrounding
> repository. Install and run it from inside the `standalone-shop/` directory.
