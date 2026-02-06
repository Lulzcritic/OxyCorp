
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
  console.log('Seeding Merchant User...');
  
  // 1. Create Merchant Info
  const merchantEmail = 'merchant@oxycorp.io';
  // Fixed UUID for consistency
  const merchantId = '11111111-1111-1111-1111-111111111111'; 
  
  // 2. Upsert Merchant
  const user = await prisma.user.upsert({
    where: { username: merchantEmail },
    update: { credits: 100000n },
    create: {
      id: merchantId,
      username: merchantEmail,
      credits: 100000n,
      bunker_level: 10,
    },
  });
  
  console.log(`Merchant ${user.username} is ready with ${user.credits} credits.`);
  
  // 3. Create Listing (50 Iron Ore @ 5 Credits each)
  // This listing is guaranteed to NOT be the current user (unless they logged in as merchant)
  const item = 'IRON_ORE';
  const qty = 50n;
  const price = 5n;
  
  // First ensure merchant has inventory
  await prisma.inventory.upsert({
    where: { userId_item: { userId: user.id, item } },
    update: { quantity: 10000n },
    create: { userId: user.id, item, quantity: 10000n },
  });
  
  // Create listing
  const listing = await prisma.marketListing.create({
    data: {
      sellerId: user.id,
      itemId: item,
      quantity: qty,
      pricePerUnit: price,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  
  console.log(`Created Listing: ${listing.id} - ${qty}x ${item} @ ${price} CR`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
