/**
 * Resource Node Component
 * 
 * Interactive 3D object for harvesting resources found on plots.
 * Spawns a crystal cluster that players can gather.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Mesh, MeshStandardMaterial } from 'three';
import { usePlotStore } from '../../services/PlotStore';

interface ResourceNodeProps {
  id: string; // Unique ID for this specific node
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isOwned: boolean;
}

export default function ResourceNode({
  id,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  isOwned,
}: ResourceNodeProps) {
  const crystalRef = useRef<Mesh>(null);
  const harvested = usePlotStore((s) => s.harvestedNodes[id]);
  const harvestNode = usePlotStore((s) => s.harvestNode);

  const handleHarvest = () => {
    if (!isOwned) {
      alert("UNAUTHORIZED ACTIVITY: You cannot harvest minerals on unowned territory.");
      return;
    }
    if (!harvested) {
      harvestNode(id);
      console.log(`[RESOURCE SYSTEM] Harvested node ${id}`);
    }
  };

  // Pulse animation for active crystals
  useFrame((state) => {
    if (!harvested && crystalRef.current) {
      const material = crystalRef.current.material as MeshStandardMaterial;
      // Oscillate emissive intensity between 0.2 and 1.0
      material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.4;
    }
  });

  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <group scale={[scale, scale, scale]}>
        {/* The targetable trigger mesh (slightly larger than visual) */}
        {!harvested && (
          <mesh
            visible={false}
            userData={{
              isTerminal: true,
              terminalType: 'RESOURCE',
              label: isOwned ? 'HARVEST MINERALS' : 'RESTRICTED RESOURCE [UNOWNED]',
              onInteract: handleHarvest,
            }}
          >
            <boxGeometry args={[3, 3, 3]} />
          </mesh>
        )}

        {/* Visual Crystal Cluster (Main Crystal) */}
        <mesh ref={crystalRef} castShadow receiveShadow position={[0, 1, 0]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={harvested ? '#333333' : '#00FF9D'}
            emissive={harvested ? '#000000' : '#00FF9D'}
            emissiveIntensity={harvested ? 0 : 0.8}
            roughness={harvested ? 0.9 : 0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Small adjacent crystal */}
        <mesh castShadow receiveShadow position={[0.8, 0.5, 0.5]} rotation={[0.2, 0.5, -0.4]} scale={0.7}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={harvested ? '#222222' : '#00FF9D'}
            emissive={harvested ? '#000000' : '#00FF9D'}
            emissiveIntensity={harvested ? 0 : 0.5}
            roughness={harvested ? 0.9 : 0.2}
            metalness={0.8}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
