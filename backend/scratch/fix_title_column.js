const { Client } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function fixSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    console.log('Adding "title" column to "LivestockPlan" table...');
    await client.query(`
      ALTER TABLE "LivestockPlan" 
      ADD COLUMN IF NOT EXISTS "title" TEXT DEFAULT 'Investment Plan';
    `);

    console.log('Schema update successful.');

    // Also check if we need to seed some titles if they are empty
    await client.query(`
      UPDATE "LivestockPlan" 
      SET "title" = "type" 
      WHERE "title" = 'Investment Plan' OR "title" IS NULL;
    `);
    console.log('Refined titles based on plan type.');

  } catch (err) {
    console.error('Database migration error:', err);
  } finally {
    await client.end();
  }
}

fixSchema();
