import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const count = await prisma.user.count();
  const users = await prisma.user.findMany({
    select: { id: true, username: true, sectors: { select: { x: true, y: true, type: true } } }
  });
  console.log(`Total Users: ${count}`);
  console.log(JSON.stringify(users, null, 2));
}

checkUsers()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
