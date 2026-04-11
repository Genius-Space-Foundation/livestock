const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@livestock.com' },
    update: {},
    create: {
      fullName: 'Farm Admin',
      email: 'admin@livestock.com',
      phone: '0500000000',
      password: adminPassword,
      role: 'admin',
      wallet: {
        create: { balance: 0 }
      }
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // Create Test User
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      fullName: 'John Doe',
      email: 'user@example.com',
      phone: '0544444444',
      password: userPassword,
      role: 'user',
      wallet: {
        create: { balance: 1000 }
      }
    },
  });
  console.log(`User created: ${user.email}`);

  // Add some plans
  const plans = [
    { type: 'Poultry', description: 'Broiler chicken investment', duration: '3 months', price: 50, status: 'active' },
    { type: 'Cattle', description: 'Bull fattening program', duration: '6 months', price: 50, status: 'active' },
    { type: 'Goat', description: 'Local breed goat rearing', duration: '4 months', price: 50, status: 'active' },
  ];

  const existingPlans = await prisma.livestockPlan.findMany();
  
  if (existingPlans.length === 0) {
    for (const plan of plans) {
      await prisma.livestockPlan.create({
        data: plan,
      });
    }
    console.log('Plans seeded');
  } else {
    console.log('Plans already exist, skipping...');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
