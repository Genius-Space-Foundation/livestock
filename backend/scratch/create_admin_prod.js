process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Production URL from environment variable (Render) or local fallback
const prodUrl = process.env.DATABASE_URL || "postgresql://postgres.vfcqutskgthjhggslbvg:U0Eozf0z5YYRfWJ5@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require";

async function main() {
  const client = new Client({
    connectionString: prodUrl,
    ssl: { rejectUnauthorized: false }
  });

  console.log('--- PRODUCTION ADMIN CREATION (RAW PG) ---');
  
  const ADMIN_EMAIL = 'admin@livestock.com';
  const ADMIN_PASS = 'AdminSecure2026!';

  try {
    await client.connect();
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASS, salt);

    console.log(`Checking if ${ADMIN_EMAIL} exists...`);
    
    const checkRes = await client.query('SELECT id FROM "User" WHERE email = $1', [ADMIN_EMAIL]);

    if (checkRes.rows.length > 0) {
      console.log('User exists. Promoting to Admin and updating password...');
      await client.query(
        'UPDATE "User" SET role = $1, password = $2, "fullName" = $3 WHERE email = $4',
        ['admin', hashedPassword, 'System Administrator', ADMIN_EMAIL]
      );
    } else {
      console.log('User does not exist. Creating new Admin...');
      const userId = crypto.randomUUID();
      await client.query(
        'INSERT INTO "User" (id, "fullName", email, phone, password, role, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [userId, 'System Administrator', ADMIN_EMAIL, '0000000000', hashedPassword, 'admin']
      );
      
      // Create wallet
      const walletId = crypto.randomUUID();
      await client.query(
        'INSERT INTO "Wallet" (id, "userId", "updatedAt") VALUES ($1, $2, NOW())',
        [walletId, userId]
      );
    }

    console.log(`\n✅ SUCCESS: Account "${ADMIN_EMAIL}" is now an ADMIN in Production.`);
    console.log(`🔑 Login Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Login Password: ${ADMIN_PASS}`);
    console.log(`📍 Login URL: /livestockportaln`);

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
  } finally {
    await client.end();
  }
}

main();
