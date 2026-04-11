require('dotenv').config();
const prisma = require('./config/db');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Using app prisma instance to run SQL...');
  try {
    // Read the file as buffer and then convert or try different encodings
    let sqlBuffer = fs.readFileSync('create_tables.sql');
    let sql = sqlBuffer.toString('utf8');
    
    // Check if it looks like UTF-16 (lots of null bytes or non-printable chars)
    if (sql.includes('\0')) {
      console.log('Detected null bytes, trying UTF-16LE encoding...');
      sql = sqlBuffer.toString('utf16le');
    }
    
    // Remove BOM if present
    sql = sql.replace(/^\uFEFF/, '');
    
    // Split by ';' and handle potential multi-line statements
    const statements = sql.split(/;\r?\n|;$/).filter(s => s.trim() !== '');
    
    console.log(`Executing ${statements.length} statements...`);
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await prisma.$executeRawUnsafe(statement);
    }
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
