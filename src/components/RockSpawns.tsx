import { useMemo } from 'react';
import { MineableRock } from './MineableRock';
import { createSeededRandom } from '../utils/seed';

export default function RockSpawns({ seed }: { seed: string }) {
  const rng = useMemo(() => createSeededRandom(seed), [seed]);

  const rocks = useMemo(() => {
    const result: { position: [number, number, number]; id: string }[] = [];

    for (let i = 0; i < 15; i++) {
      const x = (rng() - 0.5) * 200;
      const z = (rng() - 0.5) * 200;
      result.push({
        id: `rock-${i}`,
        position: [x, 0.5, z],
      });
    }

    return result;
  }, [rng]);

  return (
    <>
      {rocks.map(({ id, position }) => (
        <MineableRock key={id} id={id} position={position} />
      ))}
    </>
  );
}