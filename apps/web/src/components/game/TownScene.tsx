import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Environment, Html } from '@react-three/drei';
import PlayerController from './PlayerController';
import PlayerModel from './PlayerModel';
import MartianTerrain from './MartianTerrain';
import MartianLighting from './MartianLighting';
import { useTownSocket } from '../../services/useTownSocket';
import NPCObject from './NPCObject';

function RemotePlayer({ player }: { player: any }) {
  const prevPos = useRef({ x: player.posX, y: player.posY, z: player.posZ });
  const [moving, setMoving] = React.useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const dx = player.posX - prevPos.current.x;
    const dy = player.posY - prevPos.current.y;
    const dz = player.posZ - prevPos.current.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > 0.05) {
      setMoving(true);
      prevPos.current = { x: player.posX, y: player.posY, z: player.posZ };

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setMoving(false);
      }, 300);
    }
  }, [player.posX, player.posY, player.posZ]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <group position={[player.posX, player.posY, player.posZ]} rotation={[0, player.rotY, 0]}>
      <PlayerModel moving={moving} />
      <Html distanceFactor={12} position={[0, 2.3, 0]} center>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#00F3FF',
            border: '1px solid #00F3FF',
            padding: '2px 6px',
            fontFamily: 'monospace',
            fontSize: '11px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)',
          }}
        >
          {player.username}
        </div>
      </Html>
    </group>
  );
}

export default function TownScene() {
  // Connect to the Tarsis Prime social town hub coordinates (10, 10) room
  const { players, updateLocalPosition } = useTownSocket('tarsis-prime');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 5, 10],
        }}
        shadows
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
      >
        {/* Martian sky/fog */}
        <color attach="background" args={['#0e1b24']} />
        <fog attach="fog" args={['#0e1b24', 20, 150]} />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <MartianLighting />
            
            {/* The procedural crater floor */}
            <MartianTerrain seed={99} size={200} resolution={100} />

            {/* Other Online Players in 3D */}
            {players.map((p) => (
              <RemotePlayer key={p.userId} player={p} />
            ))}

            {/* Local Player */}
            <PlayerController
              spawnPosition={[0, 2, 0]}
              onMove={updateLocalPosition}
            />

            {/* Town NPCs */}
            <NPCObject
              npcId="DECIMUS"
              npcName="Navigateur Decimus"
              npcRole="Cartography & Onboarding"
              avatar="🧭"
              color="#00F3FF"
              position={[4, 0, -4]}
              rotation={[0, -Math.PI / 4, 0]}
            />
            <NPCObject
              npcId="HELENA"
              npcName="Sister Helena"
              npcRole="Smelting & Drone Forge"
              avatar="🔥"
              color="#FF9500"
              position={[-4, 0, -4]}
              rotation={[0, Math.PI / 4, 0]}
            />
            <NPCObject
              npcId="ARBITRE_01"
              npcName="Arbitre-01"
              npcRole="Compliance AI"
              avatar="🤖"
              color="#00FF9D"
              position={[6, 0, 3]}
              rotation={[0, -Math.PI / 1.5, 0]}
            />
            <NPCObject
              npcId="V_45"
              npcName="V-45"
              npcRole="Auction & Logistics"
              avatar="⚖️"
              color="#FFA500"
              position={[-6, 0, 3]}
              rotation={[0, Math.PI / 1.5, 0]}
            />
            <NPCObject
              npcId="KAELEN"
              npcName="Commandant Kaelen"
              npcRole="Tactical Command"
              avatar="⚔️"
              color="#FF0055"
              position={[0, 0, -8]}
              rotation={[0, 0, 0]}
            />

            {/* Environment map for realistic PBR reflections */}
            <Environment preset="sunset" background={false} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
