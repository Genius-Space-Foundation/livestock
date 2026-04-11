require('dotenv').config();
const prisma = require('./config/db');

async function main() { 
  await prisma.application.deleteMany(); 
  console.log('Successfully cleared all applications.'); 
} 
main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); process.exit(1); });
