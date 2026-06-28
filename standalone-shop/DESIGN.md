# NOVAshop — Design Document

A dynamic e-commerce **standalone site** (独立站) built with Next.js and Prisma.

## 1. Goal

A self-contained online store that runs independently (not on a marketplace):
browse products, view details, manage a cart, and place real orders that are
persisted to a database with server-side price and stock validation.

## 2. Tech stack

| Layer        | Choice                                  | Why |
|--------------|-----------------------------------------|-----|
| Framework    | **Next.js 15** (App Router, RSC)        | One codebase for UI + API, server components for data fetching |
| UI           | **React 19** + **Tailwind CSS**         | Fast, consistent styling |
| ORM          | **Prisma** (`@prisma/client`)           | Type-safe DB access |
| DB engine    | **SQLite** via `@prisma/adapter-better-sqlite3` | Zero external services; driver-adapter / query-compiler path needs no native Prisma engine binary |
| Language     | **TypeScript**                          | End-to-end type safety |

The driver-adapter setup means the client talks to SQLite through a JS driver
(`better-sqlite3`) rather than a downloaded Prisma query-engine binary — the
direction Prisma 7 is moving toward.

## 3. Data model

```
Category 1───* Product 1───* OrderItem *───1 Order
```

- **Category** — `name`, unique `slug`.
- **Product** — `name`, unique `slug`, `description`, `price` (cents),
  `image`, `stock`, `featured`, FK `categoryId`.
- **Order** — `customerName`, `email`, `address`, `total` (cents),
  `status` (default `pending`), `createdAt`.
- **OrderItem** — snapshot of `name` + `price` + `quantity` at purchase time,
  FK `orderId` (cascade delete) and `productId`.

Prices are stored as integer **cents** to avoid floating-point money bugs;
formatting to `$xx.xx` happens only in the UI (`src/lib/format.ts`).

## 4. Pages & routes

| Route                | Type     | Purpose |
|----------------------|----------|---------|
| `/`                  | dynamic  | Hero, category grid, featured products |
| `/products`          | dynamic  | All products + `?category=` filter |
| `/products/[slug]`   | dynamic  | Product detail + add to cart |
| `/cart`              | client   | Cart management + checkout form |
| `/order/[id]`        | dynamic  | Order confirmation, reads order from DB |
| `/api/orders` (POST) | API      | Validates and creates an order |
| `not-found`          | static   | 404 page |

## 5. Cart & checkout flow

The cart is **client-side** (`CartProvider`, React Context + `localStorage`)
so adding items needs no round-trip and survives reloads. At checkout the
client POSTs `{ customer info, items: [{id, quantity}] }` to `/api/orders`.

The API route is the **trust boundary**: it ignores any client-supplied price,
re-reads each product from the DB, validates quantity and stock, computes the
authoritative total, and creates the `Order` + `OrderItem`s while decrementing
stock inside a single `prisma.$transaction`. The client is then redirected to
`/order/[id]`, which renders from the DB.

```
Browser cart (localStorage)
      │  POST /api/orders { items:[{id,quantity}], customer }
      ▼
API route ── re-fetch products ── validate price/stock ── $transaction:
                                                              create Order
                                                              decrement stock
      │  { orderId }
      ▼
redirect → /order/[id] (server-rendered from DB)
```

## 6. Project structure

```
standalone-shop/
├── prisma/
│   ├── schema.prisma      # data model
│   └── seed.ts            # 4 categories, 12 products
├── src/
│   ├── app/               # routes (App Router)
│   ├── components/        # navbar, cart provider, product card, …
│   └── lib/               # prisma client, queries, formatting
├── next.config.mjs
└── package.json
```

## 7. Possible extensions

- User accounts & auth, persisted server-side carts
- Real payment provider (Stripe) instead of the demo checkout
- Admin dashboard for products/orders
- Product search & pagination
- Swap SQLite for Postgres by changing the datasource + adapter only
