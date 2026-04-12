require('dotenv').config();
const prisma = require('../config/db');

async function main() {
  const plans = [
    {
      type: 'Poultry',
      title: 'Poultry – Layers',
      description: 'Invest in a flock of layer hens producing eggs for sale across local and regional markets. Enjoy steady weekly yields and transparent farm updates.',
      duration: '6 months',
      price: 100,
      roiPercentage: 35,
      status: 'active',
    },
    {
      type: 'Poultry',
      title: 'Poultry – Broilers',
      description: 'Fund a batch of broiler chickens raised for meat. Fast turnover, high demand, and transparent growth tracking from day-old chicks to market weight.',
      duration: '3 months',
      price: 100,
      roiPercentage: 25,
      status: 'active',
    },
    {
      type: 'Goat',
      title: 'Goat Rearing',
      description: 'Participate in goat farming with a focus on meat production. Goats are resilient, low-maintenance, and in high demand across West Africa.',
      duration: '8 months',
      price: 100,
      roiPercentage: 40,
      status: 'active',
    },
    {
      type: 'Cattle',
      title: 'Cattle Fattening',
      description: 'Invest in cattle raised for premium beef. This high-value plan targets the growing urban demand for quality meat with professional ranching.',
      duration: '12 months',
      price: 100,
      roiPercentage: 55,
      status: 'active',
    },
    {
      type: 'Pig',
      title: 'Pig Farming',
      description: 'Support a piggery operation focused on pork production. Pigs grow fast, reproduce quickly, and offer one of the best ROI profiles in livestock.',
      duration: '6 months',
      price: 100,
      roiPercentage: 38,
      status: 'active',
    },
    {
      type: 'Fish',
      title: 'Fish Farming (Tilapia)',
      description: 'Invest in tilapia aquaculture — one of the fastest-growing agricultural sectors. Controlled pond environments ensure consistent yields.',
      duration: '4 months',
      price: 100,
      roiPercentage: 28,
      status: 'inactive',
    },
  ];

  console.log('Seeding plans...');

  for (const plan of plans) {
    await prisma.livestockPlan.upsert({
      where: { id: '' }, // We use upsert with a dummy where clause or find unique to avoid duplicates
      update: {},
      create: plan,
    });
  }

  // A better upsert since we don't have IDs yet:
  for (const plan of plans) {
    const existing = await prisma.livestockPlan.findFirst({
      where: { title: plan.title }
    });
    
    if (!existing) {
      await prisma.livestockPlan.create({ data: plan });
    }
  }

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
