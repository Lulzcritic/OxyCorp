import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

type VehicleProps = {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  playerRef?: React.RefObject<THREE.Group>;
  onInteract?: () => void;
};

export default function Vehicle({
  position = [5, 0, -5],
  scale = 1,
  rotation = [0, Math.PI / 2, 0],
  playerRef,
  onInteract,
}: VehicleProps) {
  const { scene } = useGLTF('/models/vehicle.glb');
  const ref = useRef<THREE.Group>(null);
  const [canInteract, setCanInteract] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Référence au joueur
  const vehiclePos = new THREE.Vector3(...position);

  useFrame(() => {
    if (!playerRef?.current) return;

    const playerPos = playerRef.current.position;
    const dist = playerPos.distanceTo(vehiclePos);
    setCanInteract(dist < 5); // rayon de 3 unités
  });

  return (
    <>
    <primitive
      object={scene}
      ref={ref}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={(e:any) => {
        e.stopPropagation();
        if (canInteract) setShowMenu(true);
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    />

    {showMenu && canInteract && (
        <Html position={[...position]} center>
          <div style={{ background: '#000a', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'white' }}>
            <h4>Expédition</h4>
            <button onClick={() => { onInteract && onInteract(); setShowMenu(false); }}>Mining</button>
          </div>
        </Html>
      )}
    </>
  );
}
