
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResources() {
  const resourceSectors = await prisma.sector.findMany({
    where: { type: 'RESOURCE' },
    take: 5
  });

  console.log('Resource Sectors Sample:', JSON.stringify(resourceSectors, null, 2));
}

checkResources()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
