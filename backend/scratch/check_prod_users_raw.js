const { Client } = require('pg');

// Production URL from your config
const prodUrl = "postgresql://postgres.vfcqutskgthjhggslbvg:U0Eozf0z5YYRfWJ5@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require";

async function checkUsers() {
  const client = new Client({
    connectionString: prodUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('--- CONNECTED TO PRODUCTION DATABASE ---');

    // Check for Admins
    const adminRes = await client.query("SELECT id, \"fullName\", email, role FROM \"User\" WHERE role = 'admin'");
    
    if (adminRes.rows.length === 0) {
      console.log('❌ NO ADMIN ACCOUNTS FOUND IN PRODUCTION.');
      
      // List last 5 users to see who is there
      const latestRes = await client.query("SELECT \"fullName\", email, role FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 5");
      console.log('\nLATEST 5 USERS IN DATABASE:');
      latestRes.rows.forEach(user => {
        console.log(`- ${user.fullName} (${user.email}) [Role: ${user.role}]`);
      });

    } else {
      console.log(`✅ FOUND ${adminRes.rows.length} ADMIN(S):`);
      adminRes.rows.forEach(admin => {
        console.log(`- ${admin.fullName} (${admin.email})`);
      });
    }

  } catch (err) {
    console.error('DATABASE_ERROR:', err.message);
  } finally {
    await client.end();
  }
}

checkUsers();
