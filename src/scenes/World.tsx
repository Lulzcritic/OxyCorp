import Character from '../components/Character';
import { useRef, useState } from 'react';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import { Group } from 'three';
import PlayerBase from '../components/PlayerBase';
import Bunker from '../assets/models/Bunker';
import Vehicle from '../assets/models/Vehicle';
import MiningParcel from '../components/MiningParcel';
import { Physics, RigidBody } from '@react-three/rapier';
import { supabase } from '../../supabase/client';
import Town from '../scenes/Town';
import { useFont } from '@react-three/drei';
import { useEffect } from 'react';

export function FontPreloader() {
  useEffect(() => {
    // Chemin vers ta police .woff/.ttf dans /public
    // (Inter-Regular.woff est un exemple, mets la tienne)
    // @ts-ignore - la méthode statique existe sur le hook
    useFont.preload('/fonts/Inter-Regular.woff');
  }, []);
  return null;
}

export default function World({ self }: { self: { id: string; username: string; skin: string } }) {
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
              <PlayerBase />
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
          <ambientLight intensity={10} color="rgba(129, 52, 0, 1)" />
          <directionalLight
            position={[30, 50, -10]}
            intensity={5}
            color="rgba(180, 82, 1, 0.84)"
            castShadow
          />
          <color attach="background" args={['rgba(202, 111, 83, 0.86)']} />
          <fog attach="fog" args={['rgba(180, 81, 0, 1)', 30, 100]} />
        </>
      )}

      {currentZone.type === 'mining' && currentZone.seed && (
        <>
          {/* ... */}
          <FontPreloader />
          <Physics gravity={[0, -9.81, 0]}>
            <MiningParcel seedMining={currentZone.seed} playerRef={charRef}/>
            <RigidBody type="fixed" colliders="trimesh">
              <Vehicle
                position={[-1, 0.2, -10]}
                scale={2.5}
                rotation={[0, Math.PI / 1.1, 0]}
                playerRef={charRef}
                actions={vehicleActions}
              />
            </RigidBody>
            <Character ref={charRef} />
            {/* Le vehicle peut proposer d'autres actions ici aussi si tu veux */}
          </Physics>
          <ThirdPersonCamera target={charRef} />
          <ambientLight intensity={10} color="rgba(129, 52, 0, 1)" />
          <directionalLight
            position={[30, 50, -10]}
            intensity={5}
            color="rgba(180, 82, 1, 0.84)"
            castShadow
          />
          <color attach="background" args={['rgba(202, 111, 83, 0.86)']} />
          <fog attach="fog" args={['rgba(180, 81, 0, 1)', 30, 100]} />
        </>
      )}

      {currentZone.type === 'town' && (
        <>
          {/* Ta scène Town ici */}
          <Town self={self} />
        </>
      )}
    </>
  );
}
