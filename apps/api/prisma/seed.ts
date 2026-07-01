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
    },
  });
  console.log(`✓ Test user seeded: ${testUser.email} / password123`);
  // Seed DroneVariants
  const drones = [
    {
      id: 'DRONE_ATTACK_V1',
      name: 'Wasp I',
      description: 'Standard issue attack drone.',
      attack: 10,
      defense: 2,
      speed: 5,
      range: 1,
      health: 50,
      tier: 1,
    },
    {
      id: 'DRONE_DEFENSE_V1',
      name: 'Guardian I',
      description: 'Heavy plated defense drone.',
      attack: 2,
      defense: 10,
      speed: 2,
      range: 1,
      health: 100,
      tier: 1,
    },
    {
      id: 'DRONE_SPEED_V1',
      name: 'Runner I',
      description: 'High speed scout drone.',
      attack: 5,
      defense: 5,
      speed: 8,
      range: 2,
      health: 40,
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
        { x: 0, y: 2, droneId: 'DRONE_ATTACK_V1' },
        { x: 1, y: 1, droneId: 'DRONE_ATTACK_V1' },
        { x: 1, y: 3, droneId: 'DRONE_DEFENSE_V1' },
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
        { x: 4, y: 2, droneId: 'DRONE_DEFENSE_V1' },
        { x: 3, y: 1, droneId: 'DRONE_SPEED_V1' },
        { x: 3, y: 3, droneId: 'DRONE_ATTACK_V1' },
      ],
      isActive: true,
    },
  });

  console.log('✓ Demo swarms seeded');
  console.log(`  - ${demoSwarmA.name} (${demoSwarmA.id})`);
  console.log(`  - ${demoSwarmB.name} (${demoSwarmB.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
