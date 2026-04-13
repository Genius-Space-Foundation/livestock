const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.vfcqutskgthjhggslbvg:U0Eozf0z5YYRfWJ5@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
    }
  }
});

async function check() {
  try {
    const res = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'LivestockPlan' AND column_name = 'image';`;
    console.log('RESULT:', JSON.stringify(res));
  } catch (err) {
    console.error('DIAGNOSTIC_ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
