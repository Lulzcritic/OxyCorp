// src/scenes/Town.tsx (extrait)
import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { supabase } from '../../supabase/client';
import { useTownChannel } from '../game/useTownChannel';
import Character from '../components/Character';
import { Physics, RigidBody } from '@react-three/rapier';
import MartianTerrain from '../components/PlayerBase';
import ThirdPersonCamera from '../components/ThirdPersonCamera';
import RemoteAvatar from '../components/RemoteAvatar';

export default function Town({ self }: { self: { id: string; username: string; skin: string } }) {
  const meRef = useRef<THREE.Object3D>(null);

  const getSelfPose = useCallback(() => {
    if (!meRef.current) return { p: [0,0,0] as [number,number,number], ry: 0 };
    const wp = new THREE.Vector3();
    meRef.current.getWorldPosition(wp);
    return { p: [wp.x, wp.y, wp.z] as [number,number,number], ry: meRef.current.rotation.y };
  }, []);

  const { peers } = useTownChannel(supabase, self, getSelfPose, 'town:global', 10);

  return (
    <>
      <Physics gravity={[0, -9.81, 0]}>
        <Character ref={meRef} />
        {Array.from(peers, ([id, peer]) => (
          <RemoteAvatar key={`peer-${id}`} peer={peer} modelUrl="/models/player.glb" />
        ))}
        <RigidBody type="fixed" colliders="trimesh">
            <MartianTerrain />
        </RigidBody>
      </Physics>
      <ThirdPersonCamera target={meRef} />
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
  );
}
