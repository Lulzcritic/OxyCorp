import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean up existing test users to ensure their inventories are recreated with the new drones
  const testUserIds = ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'];
  await prisma.inventory.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.job.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.marketListing.deleteMany({ where: { sellerId: { in: testUserIds } } });
  await prisma.swarm.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.sector.deleteMany({ where: { ownerId: { in: testUserIds } } });
  await prisma.bunkerFacility.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.quest.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.userSkills.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.townSnapshot.deleteMany({ where: { playerId: { in: testUserIds } } });
  await prisma.cartridge.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.userSeasonStats.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.userQuestState.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });

  // Seed Test User
  const passwordHash = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@oxycorp.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      username: 'TestPlayer',
      email: 'test@oxycorp.com',
      passwordHash,
      credits: 5000,
      bunker_level: 1,
      specialization: 'FORGE',
      inventory: {
        create: [
          { item: 'CARTRIDGE_BLANK', quantity: 10 },
          { item: 'DRONE_GUARDIAN', quantity: 20 },
          { item: 'DRONE_CARRIER', quantity: 20 },
          { item: 'DRONE_KAMIKAZE', quantity: 20 },
          { item: 'DRONE_JAMMER', quantity: 20 },
          { item: 'DRONE_COMMANDO', quantity: 20 },
          { item: 'IRON', quantity: 100 },
        ]
      },
      sectors: {
        create: [
          { x: 0n, y: 0n, type: 'BUNKER' },
          { x: 0n, y: 1n, type: 'RESOURCE', resources: { type: 'IRON', quantity: 500, richness: 80 } }
        ]
      }
    },
  });
  console.log(`✓ Test user seeded: ${testUser.email} / password123`);

  const testUser2 = await prisma.user.upsert({
    where: { email: 'test2@oxycorp.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'TestPlayer2',
      email: 'test2@oxycorp.com',
      passwordHash,
      credits: 5000,
      bunker_level: 1,
      specialization: 'FORGE',
      inventory: {
        create: [
          { item: 'CARTRIDGE_BLANK', quantity: 10 },
          { item: 'DRONE_GUARDIAN', quantity: 20 },
          { item: 'DRONE_CARRIER', quantity: 20 },
          { item: 'DRONE_KAMIKAZE', quantity: 20 },
          { item: 'DRONE_JAMMER', quantity: 20 },
          { item: 'DRONE_COMMANDO', quantity: 20 },
          { item: 'IRON', quantity: 100 },
        ]
      },
      sectors: {
        create: [
          { x: 0n, y: 5n, type: 'BUNKER' },
          { x: 0n, y: 6n, type: 'RESOURCE', resources: { type: 'IRON', quantity: 500, richness: 80 } }
        ]
      }
    },
  });
  console.log(`✓ Second test user seeded: ${testUser2.email} / password123`);
  // Seed DroneVariants
  const drones = [
    {
      id: 'DRONE_GUARDIAN',
      name: 'Guardian I',
      description: 'Heavy plated defense drone.',
      attack: 10,
      defense: 2,
      speed: 2,
      range: 1,
      health: 200,
      tier: 1,
    },
    {
      id: 'DRONE_CARRIER',
      name: 'Carrier I',
      description: 'Logistics and support drone.',
      attack: 20,
      defense: 2,
      speed: 3,
      range: 1,
      health: 150,
      tier: 1,
    },
    {
      id: 'DRONE_KAMIKAZE',
      name: 'Kamikaze I',
      description: 'Explosive suicide drone.',
      attack: 80,
      defense: 0,
      speed: 6,
      range: 1,
      health: 20,
      tier: 1,
    },
    {
      id: 'DRONE_JAMMER',
      name: 'Jammer I',
      description: 'Signal scrambler drone.',
      attack: 30,
      defense: 2,
      speed: 4,
      range: 1,
      health: 80,
      tier: 1,
    },
    {
      id: 'DRONE_COMMANDO',
      name: 'Commando I',
      description: 'Elite multi-role combat drone.',
      attack: 50,
      defense: 4,
      speed: 4,
      range: 1,
      health: 100,
      tier: 1,
    },
  ];

  for (const drone of drones) {
    await prisma.droneVariant.upsert({
      where: { id: drone.id },
      update: drone,
      create: drone,
    });
  }

  console.log('✓ Drone variants seeded');

  // Seed demo swarms for battle testing
  const demoSwarmA = await prisma.swarm.upsert({
    where: { id: 'demo-swarm-a' },
    update: {},
    create: {
      id: 'demo-swarm-a',
      userId: '00000000-0000-0000-0000-000000000000', // Placeholder user
      name: 'Alpha Squadron',
      formation: [
        { slotIndex: 0, droneId: 'DRONE_GUARDIAN', count: 10 },
        { slotIndex: 1, droneId: 'DRONE_CARRIER', count: 5 },
        { slotIndex: 2, droneId: 'DRONE_KAMIKAZE', count: 8 },
      ],
      isActive: true,
    },
  });

  const demoSwarmB = await prisma.swarm.upsert({
    where: { id: 'demo-swarm-b' },
    update: {},
    create: {
      id: 'demo-swarm-b',
      userId: '00000000-0000-0000-0000-000000000000', // Placeholder user
      name: 'Bravo Squadron',
      formation: [
        { slotIndex: 0, droneId: 'DRONE_GUARDIAN', count: 5 },
        { slotIndex: 1, droneId: 'DRONE_JAMMER', count: 3 },
        { slotIndex: 2, droneId: 'DRONE_COMMANDO', count: 1 },
      ],
      isActive: true,
    },
  });

  console.log('✓ Demo swarms seeded');
  console.log(`  - ${demoSwarmA.name} (${demoSwarmA.id})`);
  console.log(`  - ${demoSwarmB.name} (${demoSwarmB.id})`);

  // Seed surrounding sectors for TestPlayer
  const radius = 3;
  let seededSectors = 0;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx === 0 && dy === 0) continue;
      if (dx === 0 && dy === 1) continue; // Already seeded above

      const sectorX = BigInt(dx);
      const sectorY = BigInt(dy);

      // 20% RESOURCE, 80% EMPTY
      const rand = Math.random();
      const type = rand > 0.8 ? 'RESOURCE' : 'EMPTY';
      const resources = type === 'RESOURCE' ? {
        type: Math.random() > 0.5 ? 'COPPER' : 'IRON',
        quantity: Math.floor(500 + Math.random() * 500),
        richness: parseFloat((0.5 + Math.random()).toFixed(2))
      } : undefined;

      await prisma.sector.upsert({
        where: { x_y: { x: sectorX, y: sectorY } },
        update: {},
        create: {
          x: sectorX,
          y: sectorY,
          type,
          resources,
        }
      });
      seededSectors++;
    }
  }
  console.log(`✓ Surrounding territory generated: ${seededSectors} sectors seeded around (0,0)`);

  // Seed default Town sector at (10, 10)
  const townX = 10n;
  const townY = 10n;
  await prisma.sector.upsert({
    where: { x_y: { x: townX, y: townY } },
    update: { type: 'TOWN' },
    create: {
      x: townX,
      y: townY,
      type: 'TOWN',
    }
  });
  console.log(`✓ Town "Tarsis Prime" seeded at (${townX}, ${townY})`);

  // Seed protected surrounding sectors around the town (radius 1)
  let townSurrounding = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip town itself
      const sectorX = townX + BigInt(dx);
      const sectorY = townY + BigInt(dy);

      await prisma.sector.upsert({
        where: { x_y: { x: sectorX, y: sectorY } },
        update: {},
        create: {
          x: sectorX,
          y: sectorY,
          type: 'EMPTY',
        }
      });
      townSurrounding++;
    }
  }
  console.log(`✓ Seeded ${townSurrounding} protected sectors around the Town`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
