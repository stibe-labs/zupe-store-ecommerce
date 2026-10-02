# Zupe Store — Modern E-Commerce

A premium e-commerce platform for curated decor, modern accessories, and everyday essentials.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Cloudflare Workers + D1 + R2
- **Payment**: Razorpay (planned)
- **Auth**: OTP-based email verification

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## Database Setup

```bash
# Create D1 database
wrangler d1 create zupe-store-db

# Run schema
wrangler d1 execute zupe-store-db --file=d1-schema.sql
```

## Project Structure

```
src/
├── app/            ← Pages & API routes
├── components/     ← React components
├── context/        ← Auth, Cart, Wishlist providers
├── data/           ← Product data
├── lib/            ← Utilities (D1, email, etc.)
└── types/          ← TypeScript definitions
```
