/**
 * seed.js — populates the database with a single sample product.
 * Run with: node backend/seed.js
 * Requires DATABASE_URL to be set in .env
 *
 * Schema reference (backend/prisma/schema.prisma):
 *   price    Int   — paise  (e.g. ₹12,999 → 1299900)
 *   discount Int   — basis points (10% → 1000)
 *   stock    Int   — unit count
 *   images   Image — { url String, publicId String }
 *
 * Removed stale fields that no longer exist in the schema:
 *   ❌ inStock    (was Boolean — removed in schema migration)
 *   ❌ stockCount (was Int    — renamed to stock)
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if product already exists to keep seed idempotent
    const existing = await prisma.product.findFirst({
      where: { name: 'Premium Maroon Bridal Chaniya Choli' },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: 'Premium Maroon Bridal Chaniya Choli',
          description:
            'A stunning maroon bridal chaniya choli with heavy embroidery and mirror work. Perfect for your special day.',
          // price in paise: ₹12,999 → 1299900
          price: 1299900,
          category: 'Bridal Wear',
          // discount in basis points: 10% → 1000
          discount: 1000,
          stock: 5,
          isFeatured: true,
          isActive: true,
          images: {
            create: [
              {
                url: 'https://images.unsplash.com/photo-1596451672692-2371973f789d?auto=format&fit=crop&q=80&w=800',
                // publicId is required by the schema (non-nullable String)
                publicId: 'shreejifashion/products/seed_maroon_bridal_1',
              },
            ],
          },
          sizes: {
            create: [
              { name: 'S' },
              { name: 'M' },
              { name: 'L' },
              { name: 'XL' },
            ],
          },
          colors: {
            create: [
              { name: 'Maroon', hexCode: '#800000' },
            ],
          },
        },
      });
      console.log('Seed: Added 1 product successfully');
    } else {
      console.log('Seed: Product already exists — skipping');
    }
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
