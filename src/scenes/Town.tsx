// src/scenes/Town.tsx (extrait)
import { useRef } from 'react';
import * as THREE from 'three';
import { supabase } from '../../supabase/client';
import { useTownChannel } from '../game/useTownChannel';
import Character from '../components/Character';
import { useFrame } from '@react-three/fiber';

export default function Town({ self }: { self: { id: string; username: string; skin: string } }) {
  const meRef = useRef<THREE.Object3D>(null);

  const getSelfPose = () => {
    if (!meRef.current) return { p: [0,0,0] as [number,number,number], ry: 0 };
    const wp = new THREE.Vector3();
    meRef.current.getWorldPosition(wp);
    return { p: [wp.x, wp.y, wp.z] as [number,number,number], ry: meRef.current.rotation.y };
  };

  const { peers } = useTownChannel(supabase, self, getSelfPose, 'town:global', 10);

  return (
    <>
      <Character ref={meRef} />
      {[...peers.values()].map((peer) => (
        <PeerGhost key={peer.id} peer={peer} />
      ))}
    </>
  );
}

// Ghost simple avec lissage
function PeerGhost({ peer }: { peer: { p: [number,number,number]; ry: number; username: string } }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.lerp(new THREE.Vector3(...peer.p), THREE.MathUtils.clamp(dt * 10, 0, 1));
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, peer.ry, THREE.MathUtils.clamp(dt * 10, 0, 1));
  });
  return (
    <group ref={ref} position={peer.p}>
      {/* Remplace par ton GLB low-poly */}
      <mesh>
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  );
}
