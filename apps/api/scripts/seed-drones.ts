
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from apps/api
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Drones...');
  
  // Find the first user (likely the dev user)
  const user = await prisma.user.findFirst();
  if (!user) {
      console.log('No user found'); 
      return;
  }
  
  const drones = ['DRONE_ATTACK_V1', 'DRONE_DEFENSE_V1', 'DRONE_SPEED_V1'];
  
  for (const item of drones) {
      await prisma.inventory.upsert({
        where: { userId_item: { userId: user.id, item } },
        update: { quantity: { increment: 5n } },
        create: {
            userId: user.id,
            item,
            quantity: 5n
        }
      });
      console.log(`Added 5x ${item} to ${user.username}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
