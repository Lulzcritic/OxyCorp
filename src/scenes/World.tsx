import { Environment, OrbitControls } from '@react-three/drei';
import Character from '../components/Character';
import { useRef, useState } from 'react';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import { Group } from 'three';
import MartianTerrain from '../components/PlayerBase';
import Bunker from '../assets/models/Bunker';
import Vehicle from '../assets/models/Vehicle';
import MiningParcel from '../components/MiningParcel';
import { Physics, RigidBody } from '@react-three/rapier';
import { supabase } from '../../supabase/client';

export default function World() {
  const [currentZone, setCurrentZone] = useState<
    { type: 'base' | 'mining' | 'town'; seed?: string; spawn?: { x:number,y:number,z:number, ry:number } }
  >({ type: 'base' });

  const charRef = useRef<Group>(null);

  const goMining = async () => {
    const seed = Math.floor(Math.random() * 1000);
    setCurrentZone({ type: 'mining', seed: seed.toString() });
  };

  const goTown = async () => {
    const { data, error } = await supabase.functions.invoke('enterTown', { body: {} });
    if (!error && data?.spawn) {
      setCurrentZone({ type: 'town', spawn: data.spawn });
    } else {
      // fallback sans backend
      setCurrentZone({ type: 'town', spawn: { x: 0, y: 0, z: 0, ry: 0 } });
    }
  };

  const vehicleActions = [
    { key: 'mining', label: 'Mining', onClick: goMining },
    { key: 'town',   label: 'Ville',  onClick: goTown   },
  ];

  return (
    <>
      {currentZone.type === 'base' && (
        <>
          {/* ... lights, env ... */}
          <Physics gravity={[0, -9.81, 0]}>
            <Character ref={charRef} />
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
                playerRef={charRef}
                actions={vehicleActions}
              />
            </RigidBody>
          </Physics>
          <ThirdPersonCamera target={charRef} />
        </>
      )}

      {currentZone.type === 'mining' && currentZone.seed && (
        <>
          {/* ... */}
          <Physics gravity={[0, -9.81, 0]}>
            <RigidBody type="fixed" colliders="trimesh">
              <MiningParcel seed={currentZone.seed} />
            </RigidBody>
            <Character ref={charRef} />
            {/* Le vehicle peut proposer d'autres actions ici aussi si tu veux */}
          </Physics>
          <ThirdPersonCamera target={charRef} />
        </>
      )}

      {currentZone.type === 'town' && (
        <>
          {/* Ta scène Town ici */}
          {/* <Town spawn={currentZone.spawn} /> */}
          <Character ref={charRef} />
          <ThirdPersonCamera target={charRef} />
        </>
      )}
    </>
  );
}
