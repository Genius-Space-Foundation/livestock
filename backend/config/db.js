const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

process.on('beforeExit', async () => {
  logger.info('Prisma closing connection due to app termination...');
  await prisma.$disconnect();
});

module.exports = prisma;
