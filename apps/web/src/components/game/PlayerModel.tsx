/**
 * Player Model Component
 * 
 * Loads the animated player character model (player.glb).
 * Plays walk animation when moving, stops when idle.
 * Uses a ref for movement state to avoid re-renders.
 */

import { useRef, useMemo, type RefObject } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

interface PlayerModelProps {
  movingRef?: RefObject<boolean>;
  moving?: boolean;
}

export default function PlayerModel({ movingRef, moving = false }: PlayerModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/player.glb');
  const { actions } = useAnimations(animations, groupRef);
  const wasMoving = useRef(false);

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Poll movement ref or prop each frame to toggle animation without re-renders
  useFrame(() => {
    const walkAction = actions['Armature|walking_man|baselayer'];
    if (!walkAction) return;

    const isMoving = movingRef ? movingRef.current : moving;
    if (isMoving && !wasMoving.current) {
      walkAction.reset().fadeIn(0.2).play();
    } else if (!isMoving && wasMoving.current) {
      walkAction.fadeOut(0.2);
    }
    wasMoving.current = isMoving;
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={clonedScene}
        scale={[1, 1, 1]}
        castShadow
      />
    </group>
  );
}

// Preload
useGLTF.preload('/models/player.glb');
