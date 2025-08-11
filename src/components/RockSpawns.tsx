import { useMemo } from 'react';
import { MineableRock } from './MineableRock';
import { createSeededRandom } from '../utils/seed';
import { createNoise2D } from 'simplex-noise';
import { mulberry32 } from '../utils/seed';

export default function RockSpawns({ seed }: { seed: string }) {
  const rng = useMemo(() => createSeededRandom(seed + '-rocks'), [seed]);

  function getHeightAt(x: number, z: number, seed: string): number {
    const hash = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const random = mulberry32(hash);
    const noise2D = createNoise2D(random);

    return noise2D(x * 0.02, z * 0.02) * 4 +
          noise2D(x * 0.1, z * 0.1) * 1.2;
  }


  const rocks = useMemo(() => {
    const dailySeed = createSeededRandom(seed + '-rocks');
    const count = 10;
    const rockData = [];

    for (let i = 0; i < count; i++) {
      const x = rng() * 300 - 150; // exemple de zone centrée
      const z = rng() * 300 - 150;
      const y = getHeightAt(x, z, seed);

      rockData.push({ id: `rock-${i}`, position: [x, y, z] });
    }

    return rockData;
  }, [seed]);

  return (
    //<MineableRock key={id} id={id} position={position} />
    <>
      {rocks.map(({ id, position }) => (
        <>
        
        <mesh position={position}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="red" />
        </mesh>

        <mesh position={[position[0], 0, position[2]]}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshStandardMaterial color="green" />
        </mesh>
        </>
      ))}
    </>
  );
}