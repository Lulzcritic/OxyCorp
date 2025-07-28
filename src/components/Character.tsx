import { forwardRef, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useControlStore } from '../game/useControlStore';
import type { Group } from 'three';
import * as THREE from 'three';

const Character = forwardRef<Group>((props, ref) => {
  const { scene, animations } = useGLTF('/models/player.glb');
  const { actions, mixer } = useAnimations(animations, scene);
  const moving = useControlStore((s) => s.moving);

  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const walkActionName = 'Armature|walking_man|baselayer';

  useEffect(() => {
    if (!actions[walkActionName]) return;

    const walkAction = actions[walkActionName];

    if (moving) {
      // Si déjà en train de jouer, ne rien faire
      if (currentActionRef.current !== walkAction) {
        currentActionRef.current?.fadeOut(0.2);
        walkAction.reset().fadeIn(0.2).play();
        walkAction.setLoop(THREE.LoopRepeat, Infinity);
        currentActionRef.current = walkAction;
      }
    } else {
      // Stopper le mouvement si actif
      if (currentActionRef.current === walkAction) {
        walkAction.fadeOut(0.3);
        currentActionRef.current = null;
      }
    }
  }, [moving, actions]);

  useFrame((_, delta) => mixer.update(delta));

  return <primitive ref={ref} object={scene} {...props} />;
});

export default Character;
