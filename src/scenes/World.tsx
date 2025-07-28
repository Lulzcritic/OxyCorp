import { Environment, OrbitControls, Sky } from '@react-three/drei';
import Character from '../components/Character';
import { useRef, useState } from 'react';
import { useCharacterControls } from '../game/useCharacterControls';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import { Group } from 'three';
import MartianTerrain from '../components/MartianTerrain';
import Bunker from '../components/Bunker';
import Vehicle from '../components/Vehicle';
import MiningParcel from '../components/MiningParcel';

export default function World() {
  const [currentZone, setCurrentZone] = useState<{ type: 'base' | 'mining'; seed?: string }>({
    type: 'base',
  });

  const handleMining = async () => {
    /*const { data } = await supabase
      .from('daily_seeds')
      .select('seed')
      .eq('date', new Date().toISOString().split('T')[0])
      .single();*/

    //if (data?.seed) {
    const seed = Math.floor(Math.random() * 1000);
      setCurrentZone({ type: 'mining', seed: seed.toString() });
    //}
  };
  const charRef = useRef<Group>(null);
  useCharacterControls(charRef);

  return (
    <>
      {currentZone.type === 'base' && (
        <>
        <OrbitControls enabled={false} />
        <Environment preset="sunset" />
        <Character ref={charRef} />
        <MartianTerrain />
        <ThirdPersonCamera target={charRef} />
        <Bunker position={[5, -1, 10]} />
        <Vehicle
          position={[-20, 0, -20]}
          scale={2.5}
          rotation={[0, Math.PI / 1.5, 0]}
          onInteract={handleMining} playerRef={charRef}
        />
        <ambientLight intensity={10} color="rgba(129, 52, 0, 1)"/>
        <directionalLight
          position={[30, 50, -10]}
          intensity={10}
          color="rgba(180, 82, 1, 0.84)" // orange rougeâtre
          castShadow
        />
        {/* Couleur du fond */}
        <color attach="background" args={['rgba(202, 111, 83, 0.86)']} />  {/* rouge brun très sombre */}
        {/* Brouillard atmosphérique */}
        <fog attach="fog" args={['rgba(180, 81, 0, 1)', 30, 100]} />
        </>
      )}
      {currentZone.type === 'mining' && currentZone.seed && (
        <>
          <OrbitControls enabled={false} />
          <MiningParcel seed={currentZone.seed} />
          <Environment preset="sunset" />
          <Character ref={charRef} />
          <ThirdPersonCamera target={charRef} />
          <ambientLight intensity={10} color="rgba(129, 52, 0, 1)"/>
          <directionalLight
            position={[30, 50, -10]}
            intensity={10}
            color="rgba(66, 39, 17, 1)" // orange rougeâtre
            castShadow
          />
          <Vehicle
            position={[-20, 0, -20]}
            scale={2.5}
            rotation={[0, Math.PI / 1.5, 0]}
            onInteract={handleMining} playerRef={charRef}
          />
          {/* Couleur du fond */}
          <color attach="background" args={['rgba(202, 111, 83, 0.86)']} />  {/* rouge brun très sombre */}
          {/* Brouillard atmosphérique */}
          <fog attach="fog" args={['rgba(180, 81, 0, 1)', 10, 100]} />
        </>
      )}
    </>
  );
}
