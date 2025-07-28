// components/ThirdPersonCamera.tsx
import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';

type Props = {
  target: RefObject<THREE.Object3D>;
};

export default function ThirdPersonCamera({ target }: Props) {
  const { camera } = useThree();
  const angle = useRef({ azimuth: Math.PI, polar: 1.2 });
  const radius = useRef(6);
  const dragging = useRef(false);
  const lastMouse = useRef<[number, number]>([0, 0]);

  const MIN_DISTANCE = 4;
  const MAX_DISTANCE = 10;

  useEffect(() => {
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
      angle.current.polar -= deltaY * 0.005;
      angle.current.polar = Math.max(0.3, Math.min(Math.PI / 2, angle.current.polar));
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      radius.current += e.deltaY * 0.01;
      radius.current = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, radius.current));
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  useFrame(() => {
    if (!target.current) return;
    const { azimuth, polar } = angle.current;
    const r = radius.current;

    const x = target.current.position.x + r * Math.sin(polar) * Math.sin(azimuth);
    const y = target.current.position.y + r * Math.cos(polar);
    const z = target.current.position.z + r * Math.sin(polar) * Math.cos(azimuth);

    camera.position.lerp(new THREE.Vector3(x, y, z), 0.1);
    camera.lookAt(target.current.position);
  });

  return null;
}
