import { useFrame, useThree } from '@react-three/fiber';
import { useControlStore } from './useControlStore';
import * as THREE from 'three';

const keys: Record<string, boolean> = {};
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => (keys[e.code] = true));
  window.addEventListener('keyup',   (e) => (keys[e.code] = false));
}

/**
 * Met à jour:
 *  - moving (bool)
 *  - axes forward/right (caméra-relatifs)
 *  - run (Shift)
 * Ne modifie plus la position: la physique (Rapier) s'en charge dans Character.tsx
 */
export function useCharacterControls(ref: React.RefObject<THREE.Object3D>) {
  const setMoving = useControlStore((s) => s.setMoving);
  const setAxes   = useControlStore((s) => s.setAxes);
  const setRun    = useControlStore((s) => s.setRun);
  const { camera } = useThree();

  const camDir   = new THREE.Vector3();
  const camRight = new THREE.Vector3();
  const moveDir  = new THREE.Vector3();

  useFrame(() => {
    if (!ref.current) return;

    // WASD -> vecteur local "input"
    const inputX = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
    const inputZ = (keys['KeyS'] ? 1 : 0) - (keys['KeyW'] ? 1 : 0);
    const hasInput = inputX !== 0 || inputZ !== 0;

    // Direction caméra (au sol)
    camera.getWorldDirection(camDir);
    camDir.y = 0; camDir.normalize();
    camRight.copy(camDir).cross(new THREE.Vector3(0, 1, 0)).normalize();

    // Vecteur de déplacement caméra‑relatif (non normalisé)
    moveDir.set(0,0,0)
      .addScaledVector(camDir, -inputZ)    // W -> avant (positive forward)
      .addScaledVector(camRight,  inputX); // D -> droite (positive right)

    // Axes dans le repère caméra : forward = proj(moveDir, camDir), right = proj(moveDir, camRight)
    const forward = hasInput ? moveDir.dot(camDir)   / moveDir.length() : 0;
    const right   = hasInput ? moveDir.dot(camRight) / moveDir.length() : 0;

    setAxes({ forward: isFinite(forward) ? forward : 0, right: isFinite(right) ? right : 0 });
    setMoving(hasInput);
    setRun(!!keys['ShiftLeft']); // sprint
  });
}
