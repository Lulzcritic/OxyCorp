/**
 * Player Model Component
 * 
 * Loads the animated player character model (player.glb).
 * Plays walk animation when moving, stops when idle.
 * Uses a ref for movement state to avoid re-renders.
 */

import { useRef, type RefObject } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerModelProps {
  movingRef: RefObject<boolean>;
}

export default function PlayerModel({ movingRef }: PlayerModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/player.glb');
  const { actions } = useAnimations(animations, groupRef);
  const wasMoving = useRef(false);

  // Poll movement ref each frame to toggle animation without re-renders
  useFrame(() => {
    const walkAction = actions['Armature|walking_man|baselayer'];
    if (!walkAction) return;

    const moving = movingRef.current;
    if (moving && !wasMoving.current) {
      walkAction.reset().fadeIn(0.2).play();
    } else if (!moving && wasMoving.current) {
      walkAction.fadeOut(0.2);
    }
    wasMoving.current = moving;
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={[1, 1, 1]}
        castShadow
      />
    </group>
  );
}

// Preload
useGLTF.preload('/models/player.glb');
