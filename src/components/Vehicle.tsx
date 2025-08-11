// src/components/Vehicle.tsx
import * as THREE from 'three';
import { useRef, useState, useMemo } from 'react';
import { useGLTF, Html, useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

type VehicleProps = {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  playerRef?: React.RefObject<THREE.Object3D>;
  onInteract?: () => void;
  debugHitbox?: boolean;
};

export default function Vehicle({
  position = [5, 0, -5],
  scale = 1,
  rotation = [0, Math.PI / 2, 0],
  playerRef,
  onInteract,
  debugHitbox = false,
}: VehicleProps) {
  const { scene } = useGLTF('/models/vehicle.glb');
  const rootRef = useRef<THREE.Group>(null);
  const [canInteract, setCanInteract] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && canInteract);

  // bbox locale du modèle gltf (sans toucher au modèle)
  const { hitboxSize, hitboxCenter } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    // garde une taille minimale pour être cliquable
    size.x = Math.max(size.x, 1);
    size.y = Math.max(size.y, 1);
    size.z = Math.max(size.z, 1);
    return { hitboxSize: size, hitboxCenter: center };
  }, [scene]);

  // positions monde pour la proximité
  const playerWorld = useRef(new THREE.Vector3());
  const vehicleWorld = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!playerRef?.current || !rootRef.current) return;
    playerRef.current.getWorldPosition(playerWorld.current);
    rootRef.current.getWorldPosition(vehicleWorld.current);
    const dist = playerWorld.current.distanceTo(vehicleWorld.current);
    setCanInteract(dist < 5);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (canInteract) setShowMenu(true);
  };

  return (
    <>
      <RigidBody type="fixed" colliders="trimesh">
        <group ref={rootRef} position={position} scale={scale} rotation={rotation}>
          {/* Modèle visuel (ne PAS déplacer via scene.position ici) */}
          <primitive object={scene} dispose={null} />

          {/* Hitbox cliquable, alignée sur le bbox du modèle */}
          <mesh
            position={hitboxCenter}
            onClick={handleClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <boxGeometry args={[hitboxSize.x, hitboxSize.y, hitboxSize.z]} />
            <meshBasicMaterial
              transparent
              opacity={debugHitbox ? 0.2 : 0}
              wireframe={debugHitbox}
              depthWrite={false}
            />
          </mesh>
        </group>
      </RigidBody>

      {showMenu && canInteract && (
        <Html transform pointerEvents="auto" position={position} center zIndexRange={[10, 0]}>
          <div style={{ background: '#000a', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'white' }}>
            <h4>Expédition</h4>
            <button
              onClick={() => {
                onInteract?.();
                setShowMenu(false);
              }}
            >
              Mining
            </button>
          </div>
        </Html>
      )}
    </>
  );
}
