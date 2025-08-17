// MiningParcelScene.tsx
import { useCallback, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import MiningTerrain from './MiningTerrain';   // ta version forwardRef
import RockSpawns from './RockSpawns';
import { RigidBody, MeshCollider } from '@react-three/rapier';

export default function MiningParcelScene({
  seedMining,
  playerRef,
}: {
  seedMining: string;
  playerRef: React.RefObject<THREE.Group>;
}) {
  const [terrainMesh, setTerrainMesh] = useState<THREE.Mesh | null>(null);

  const handleTerrainRef = useCallback((mesh: THREE.Mesh | null) => {
    setTerrainMesh(mesh);
  }, []);

  const hasSeed = !!seedMining;

  const getPlayerPos = useCallback((out?: THREE.Vector3) => {
    const v = out ?? new THREE.Vector3();
    // 🔑 lit la position MONDE du group visuel exposé par <Character />
    return playerRef?.current ? playerRef.current.getWorldPosition(v) : v.set(0, 0, 0);
  }, [playerRef]);

  console.log('seedMining:', seedMining);

  return (
    <>
      {hasSeed && (
        <RigidBody type="fixed" colliders={false}>
          <MeshCollider type="trimesh" key={`terrain-${seedMining}`}>
            <MiningTerrain
              ref={handleTerrainRef}
              seedMining={seedMining!}
              roadOrientation="y"
              roadWidth={10}
              roadShoulder={6}
              roadHeightMode="auto"
            />
          </MeshCollider>
        </RigidBody>
      )}

      {/* Rochers minables */}
      <RockSpawns
        seed={seedMining}
        terrainMesh={terrainMesh}
        getPlayerPos={getPlayerPos}
        areaSize={300}
        count={24}
      />
    </>
  );
}
