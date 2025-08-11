// components/ThirdPersonCamera.tsx
import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';

type Props = { target: RefObject<THREE.Object3D>; };

export default function ThirdPersonCamera({ target }: Props) {
  const { camera, gl } = useThree();
  const angle = useRef({ azimuth: Math.PI, polar: 1.2 });
  const radius = useRef(6);
  const dragging = useRef(false);
  const lastMouse = useRef<[number, number]>([0, 0]);

  const MIN_DISTANCE = 4;
  const MAX_DISTANCE = 10;
  const TARGET_HEIGHT = 1.4; // hauteur "yeux" du perso

  // Refs pour éviter allocations
  const worldTarget = useRef(new THREE.Vector3());
  const camDesired = useRef(new THREE.Vector3());

  useEffect(() => {
    const canvas = gl.domElement; // mieux que window pour bloquer le scroll, etc.

    const onMouseDown = (e: MouseEvent) => {
      dragging.current = true;
      lastMouse.current = [e.clientX, e.clientY];
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const [lastX, lastY] = lastMouse.current;
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      lastMouse.current = [e.clientX, e.clientY];

      angle.current.azimuth -= deltaX * 0.005;
      angle.current.polar   -= deltaY * 0.005;
      angle.current.polar    = Math.max(0.3, Math.min(Math.PI / 2, angle.current.polar));
    };
    const onMouseUp = () => { dragging.current = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius.current += e.deltaY * 0.01;
      radius.current  = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, radius.current));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl.domElement]);

  useFrame(() => {
    if (!target.current) return;

    // IMPORTANT: world position du perso (pas .position locale)
    target.current.getWorldPosition(worldTarget.current);
    worldTarget.current.y += TARGET_HEIGHT;

    const { azimuth, polar } = angle.current;
    const r = radius.current;

    camDesired.current.set(
      worldTarget.current.x + r * Math.sin(polar) * Math.sin(azimuth),
      worldTarget.current.y + r * Math.cos(polar),
      worldTarget.current.z + r * Math.sin(polar) * Math.cos(azimuth)
    );

    // Lerp doux vers la position désirée
    camera.position.lerp(camDesired.current, 0.12);
    camera.lookAt(worldTarget.current);
  });

  return null;
}
