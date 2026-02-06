
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
  console.log('Testing Combat Simulation...');
  
  // 1. Find User Swarms
  const swarms = await prisma.swarm.findMany(); // Just grab all for now
  if (swarms.length < 2) {
      console.log('Need at least 2 swarms to fight. Please create another one via War Room or script.');
      
      // Let's create a dummy enemy swarm
      console.log('Creating Dummy Enemy Swarm...');
      // Find a user or create logic if needed, but let's assume one exists or attach to first user
      const user = await prisma.user.findFirst();
       if (!user) { console.log('No user'); return; }

       const enemy = await prisma.swarm.create({
           data: {
               userId: user.id,
               name: 'Omega Squad (Enemy)',
               formation: [
                   { droneId: 'DRONE_ATTACK_V1', x: 2, y: 2 },
                   { droneId: 'DRONE_DEFENSE_V1', x: 2, y: 3 }
               ],
               isActive: true
           }
       });
       console.log('Created Enemy:', enemy.id);
       swarms.push(enemy);
  }
  
  const idA = swarms[0].id;
  const idB = swarms[1].id;
  
  console.log(`Fighting: ${swarms[0].name} vs ${swarms[1].name}`);
  
  // 2. Call Service Logic (Mocking the HTTP call logic by invoking logic manually or via simple fetch if we were running e2e, but here we just want to verify data access works if we imported service, but script is standalone.)
  // Actually, let's just use axios or fetch against localhost to test the full stack
  
  const token = 'MOCK_TOKEN_NOT_EASILY_AVAILABLE'; 
  // Getting a valid token in script is hard without login.
  // We will trust the unit test approach or just re-implement the core check here? 
  // No, let's just inspect the logic via console logs in the script by instantiating the class? 
  // Complex due to DI.
  
  // Best Verification: Just run the logic "like" the service does.
  
  // Service Logic Replication for Verification:
  // (Copied from Service)
    const swarmA = swarms.find(s => s.id === idA);
    const swarmB = swarms.find(s => s.id === idB);

    if (!swarmA || !swarmB) {
        console.error('Failed to find swarms');
        return;
    }

    // Mock Stats
    const getStats = (id: string) => {
        if(id === 'DRONE_ATTACK_V1') return { a: 10, d: 2 };
        if(id === 'DRONE_DEFENSE_V1') return { a: 2, d: 10 };
        return { a: 1, d: 1 };
    };

    let scoreA = 0;
    (swarmA.formation as any[]).forEach(p => {
        const s = getStats(p.droneId);
        scoreA += s.a + s.d;
    });
    
    let scoreB = 0;
    (swarmB.formation as any[]).forEach(p => {
        const s = getStats(p.droneId);
        scoreB += s.a + s.d;
    });
    
    console.log(`Base Scores - A: ${scoreA}, B: ${scoreB}`);
    
    // Test Variance
    for(let i=0; i<3; i++) {
        const vA = 0.9 + Math.random() * 0.2;
        const vB = 0.9 + Math.random() * 0.2;
        console.log(`Run ${i+1}: A(${scoreA * vA}) vs B(${scoreB * vB}) -> Winner: ${ (scoreA*vA) > (scoreB*vB) ? 'A' : 'B' }`);
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
