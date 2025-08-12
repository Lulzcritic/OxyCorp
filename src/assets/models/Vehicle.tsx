// src/assets/models/Vehicle.tsx
import * as THREE from 'three';
import { useRef, useState, useMemo } from 'react';
import { useGLTF, Html, useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

type VehicleAction = { key: string; label: string; onClick: () => void };

type VehicleProps = {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  playerRef?: React.RefObject<THREE.Object3D>;
  actions?: VehicleAction[]; // 👈 Nouvelles actions passées par le parent
};

export default function Vehicle({
  position = [5, 0, -5],
  scale = 1,
  rotation = [0, Math.PI / 2, 0],
  playerRef,
  actions = [],
}: VehicleProps) {
  const { scene } = useGLTF('/models/vehicle.glb');

  const rootRef = useRef<THREE.Group>(null);
  const [canInteract, setCanInteract] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && canInteract);

  // bbox locale du modèle gltf pour une hitbox cliquable
  const { hitboxSize, hitboxCenter } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
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

  const runAction = (fn: () => void) => {
    setShowMenu(false);
    fn?.();
  };

  return (
    <group ref={rootRef} position={position} scale={scale} rotation={rotation}>
      {/* Modèle visuel */}
      <primitive object={scene} dispose={null} />

      {/* Hitbox cliquable fiable */}
      <mesh
        position={hitboxCenter}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[hitboxSize.x, hitboxSize.y, hitboxSize.z]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Menu d'actions au-dessus du toit */}
      {showMenu && canInteract && actions.length > 0 && (
        <Html
          transform
          pointerEvents="auto"
          position={[hitboxCenter.x, hitboxCenter.y + hitboxSize.y * 0.65, hitboxCenter.z]}
          distanceFactor={8}
          center
        >
          <div style={{ background: '#000a', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'white', minWidth: 140 }}>
            <h4 style={{ margin: 0, marginBottom: 8 }}>Expédition</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {actions.map(a => (
                <button key={a.key} onClick={() => runAction(a.onClick)}>
                  {a.label}
                </button>
              ))}
              <button onClick={() => setShowMenu(false)} style={{ opacity: 0.7 }}>Fermer</button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
