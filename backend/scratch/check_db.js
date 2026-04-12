const { Client } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LivestockPlan';
    `);

    console.log('Columns in LivestockPlan:');
    console.table(res.rows);

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
  }
}

checkSchema();
