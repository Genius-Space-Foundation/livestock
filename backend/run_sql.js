const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const connectionString = 'postgresql://postgres.vfcqutskgthjhggslbvg:U0Eozf0z5YYRfWJ5@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require';
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to database via pg');
    
    let sqlBuffer = fs.readFileSync('create_tables.sql');
    let sql = sqlBuffer.toString('utf8');
    sql = sql.replace(/^\uFEFF/, '');
    
    // Split by ';' and handle potential multi-line statements
    const statements = sql.split(/;\r?\n|;$/).filter(s => s.trim() !== '');
    console.log(`Executing ${statements.length} statements...`);
    
    for (const statement of statements) {
      try {
        console.log('Executing:', statement.substring(0, 50).replace(/\n/g, ' ') + '...');
        await client.query(statement);
      } catch (err) {
        if (err.code === '42P07') {
          console.log('  -> Table already exists, skipping.');
        } else {
          console.error('  -> Error:', err.message);
        }
      }
    }
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    await client.end();
  }
}

main();
