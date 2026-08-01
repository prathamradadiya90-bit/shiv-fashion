const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: { name: 'Premium Maroon Bridal Chaniya Choli' }
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: 'Premium Maroon Bridal Chaniya Choli',
          description: 'A stunning maroon bridal chaniya choli with heavy embroidery and mirror work. Perfect for your special day.',
          price: 12999,
          category: 'Bridal Wear',
          discount: 10,
          inStock: true,
          stockCount: 5,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1596451672692-2371973f789d?auto=format&fit=crop&q=80&w=800' }
            ]
          }
        }
      });
      console.log('Seed: Added 1 product successfully');
    } else {
      console.log('Seed: Product already exists');
    }
  } catch (error) {
    console.error('Seed Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
