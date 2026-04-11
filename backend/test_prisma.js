const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing connection...');
  try {
    const plans = await prisma.livestockPlan.findMany();
    console.log('Connection successful! Found', plans.length, 'plans.');
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
