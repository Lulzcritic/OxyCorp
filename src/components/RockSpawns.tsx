import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createSeededRandom } from '../utils/seed';
import MineableRock from './MineableRock';

type Rock = { id: string; position: [number, number, number] };

export default function RockSpawns({
  seed,
  terrainMesh,
  getPlayerPos,
  areaSize = 300,
  count = 10,
  yStart = 1000,
  yEps = 0.02,
}: {
  seed: string;
  terrainMesh: THREE.Mesh | null;
  getPlayerPos: () => THREE.Vector3;
  areaSize?: number;
  count?: number;
  yStart?: number;
  yEps?: number;
}) {
  const raycaster = useRef(new THREE.Raycaster()).current;
  const down = useRef(new THREE.Vector3(0, -1, 0)).current;

  const [rocks, setRocks] = useState<Rock[]>([]);

  useEffect(() => {
    if (!terrainMesh) return;

    terrainMesh.updateWorldMatrix(true, true);

    const newRocks: Rock[] = [];
    for (let i = 0; i < count; i++) {
      const r = createSeededRandom(`${seed}-rocks-${i}`);
      const x = r() * areaSize - areaSize / 2;
      const z = r() * areaSize - areaSize / 2;

      const origin = new THREE.Vector3(x, yStart, z);
      raycaster.set(origin, down);

      const hits = raycaster.intersectObject(terrainMesh, true);
      if (hits.length > 0) {
        const hit = hits[0];
        const y = hit.point.y + yEps;
        newRocks.push({ id: `rock-${i}`, position: [x, y, z] });
      }
    }

    setRocks(newRocks);
  }, [terrainMesh, seed, count, areaSize, yStart, yEps]);

  const handleMined = useCallback((id: string) => {
    // Ici tu pourras appeler supabase.functions.invoke('mineRock', ...)
    setRocks((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // RockSpawns.tsx (extrait : rendu uniquement)
  return (
    <>
      {rocks.map((r) => (
        <MineableRock
          key={r.id}
          id={r.id}
          position={r.position}
          getPlayerPos={getPlayerPos}       // <— fourni par la scène
          onMined={(id) => setRocks((prev) => prev.filter((x) => x.id !== id))}
          interactRadius={3}
        />
      ))}
    </>
  );

}
