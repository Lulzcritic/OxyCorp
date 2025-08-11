import { Environment, OrbitControls } from '@react-three/drei';
import Character from '../components/Character';
import { useRef, useState } from 'react';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import { Group } from 'three';
import MartianTerrain from '../components/PlayerBase';
import Bunker from '../assets/models/Bunker';
import Vehicle from '../components/Vehicle';
import MiningParcel from '../components/MiningParcel';
import { Physics, RigidBody } from '@react-three/rapier';

export default function World() {
  const [currentZone, setCurrentZone] = useState<{ type: 'base' | 'mining'; seed?: string }>({
    type: 'base',
  });

  const handleMining = async () => {
    const seed = Math.floor(Math.random() * 1000);
    setCurrentZone({ type: 'mining', seed: seed.toString() });
  };

  const charRef = useRef<Group>(null);

  return (
    <>
      {currentZone.type === 'base' && (
        <>
          <OrbitControls enabled={false} />
          <Environment preset="sunset" />
          <Physics gravity={[0, -9.81, 0]}>
            <Character ref={charRef} />
          
            {/* Terrain avec collider Rapier */}
            <RigidBody type="fixed" colliders="trimesh">
              <MartianTerrain />
            </RigidBody>

            <RigidBody type="fixed" colliders="trimesh">
              <Bunker position={[5, -1, 10]} />
            </RigidBody>
          
            <RigidBody type="fixed" colliders="trimesh">
              <Vehicle
                position={[-20, -1, -20]}
                scale={2.5}
                rotation={[0, Math.PI / 1.5, 0]}
                onInteract={handleMining}
                playerRef={charRef}
              />
            </RigidBody>
          </Physics>

          <ThirdPersonCamera target={charRef} />
          <ambientLight intensity={10} color="rgba(129, 52, 0, 1)" />
          <directionalLight
            position={[30, 50, -10]}
            intensity={10}
            color="rgba(180, 82, 1, 0.84)"
            castShadow
          />
          <color attach="background" args={['rgba(202, 111, 83, 0.86)']} />
          <fog attach="fog" args={['rgba(180, 81, 0, 1)', 30, 100]} />
        </>
      )}

      {currentZone.type === 'mining' && currentZone.seed && (
        <>
          <OrbitControls enabled={false} />
          <Environment preset="sunset" />
          <Physics gravity={[0, -9.81, 0]}>
            <RigidBody type="fixed" colliders="trimesh">
              <MiningParcel seed={currentZone.seed} />
            </RigidBody>
            <Character ref={charRef} />
            <Vehicle
              position={[-20, 0, -20]}
              scale={2.5}
              rotation={[0, Math.PI / 1.5, 0]}
              onInteract={handleMining}
              playerRef={charRef}
            />
          </Physics>
          <ThirdPersonCamera target={charRef} />
          <ambientLight intensity={10} color="rgba(129, 52, 0, 1)" />
          <directionalLight
            position={[30, 50, -10]}
            intensity={10}
            color="rgba(66, 39, 17, 1)"
            castShadow
          />
          <color attach="background" args={['rgba(202, 111, 83, 0.86)']} />
          <fog attach="fog" args={['rgba(180, 81, 0, 1)', 10, 100]} />
        </>
      )}
    </>
  );
}
