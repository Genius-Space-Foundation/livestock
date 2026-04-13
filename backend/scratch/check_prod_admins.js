require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Use the production URL found in your scratch scripts
const prodUrl = "postgresql://postgres.vfcqutskgthjhggslbvg:U0Eozf0z5YYRfWJ5@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

const prisma = new PrismaClient({
  datasourceUrl: prodUrl
});

async function findAdmins() {
  console.log('--- CHECKING PRODUCTION ADMIN ACCOUNTS ---');
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });

    if (admins.length === 0) {
      console.log('❌ NO ADMIN ACCOUNTS FOUND IN PRODUCTION.');
      
      // Let's also check if ANY users exist
      const userCount = await prisma.user.count();
      console.log(`Total users in production: ${userCount}`);
      
      console.log('\nSUGGESTION: You may need to create or promote a user to admin.');
    } else {
      console.log(`✅ FOUND ${admins.length} ADMIN(S):`);
      admins.forEach(admin => {
        console.log(`- ${admin.fullName} (${admin.email})`);
      });
    }
  } catch (err) {
    console.error('DIAGNOSTIC_ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

findAdmins();
