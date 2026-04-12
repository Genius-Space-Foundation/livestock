const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const plans = await prisma.livestockPlan.findMany({ take: 1 });
    console.log('Successfully queried plans:', plans);
    if (plans.length > 0 && 'image' in plans[0]) {
      console.log('Image column exists!');
    } else {
      console.log('Image column does NOT exist or table is empty.');
    }
  } catch (err) {
    console.error('Error checking schema:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
