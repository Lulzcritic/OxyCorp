// game/useCharacterControls.ts
import { useFrame, useThree } from '@react-three/fiber';
import { useControlStore } from './useControlStore';
import * as THREE from 'three';

const keys: Record<string, boolean> = {};
window.addEventListener('keydown', e => (keys[e.code] = true));
window.addEventListener('keyup', e => (keys[e.code] = false));

export function useCharacterControls(ref: React.RefObject<THREE.Object3D>) {
  const setMoving = useControlStore((s) => s.setMoving);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!ref.current) return;

    const dir = new THREE.Vector3(
      (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0),
      0,
      (keys['KeyS'] ? 1 : 0) - (keys['KeyW'] ? 1 : 0)
    );

    const isMoving = dir.lengthSq() > 0;
    setMoving(isMoving);
    if (!isMoving) return;

    // Transformer le vecteur directionnel selon la rotation de la caméra
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();

    const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0));

    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(camDir, -dir.z); // caméra avant/arrière
    moveDir.addScaledVector(camRight, dir.x); // caméra gauche/droite
    moveDir.normalize();

    const speed = 5;
    ref.current.position.add(moveDir.multiplyScalar(speed * delta));

    // Tourner le perso dans la direction de déplacement
    const angle = Math.atan2(moveDir.x, moveDir.z);
    ref.current.rotation.y = angle;
  });
}
