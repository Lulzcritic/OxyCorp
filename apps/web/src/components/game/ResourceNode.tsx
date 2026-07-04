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
  index: number;
  totalNodes: number;
}

import { useParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

export default function ResourceNode({
  id,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  isOwned,
  index,
  totalNodes,
}: ResourceNodeProps) {
  const crystalRef = useRef<Mesh>(null);
  const localHarvested = usePlotStore((s) => s.harvestedNodes[id]);
  const harvestNode = usePlotStore((s) => s.harvestNode);
  const remainingQty = usePlotStore((s) => s.remainingQty);
  const capacity = usePlotStore((s) => s.capacity);
  const setResources = usePlotStore((s) => s.setResources);
  const { id: sectorId } = useParams();

  // Determine if this node is depleted based on local session harvest or server quantity limits
  let isDepleted = localHarvested;
  if (remainingQty !== null && capacity !== null && capacity > 0) {
    const activeCount = Math.ceil((remainingQty / capacity) * totalNodes);
    if (index >= activeCount) {
      isDepleted = true;
    }
  }

  const handleHarvest = async () => {
    if (!isOwned) {
      alert("UNAUTHORIZED ACTIVITY: You cannot harvest minerals on unowned territory.");
      return;
    }
    if (!isDepleted && sectorId) {
      console.log(`[RESOURCE SYSTEM] Harvesting node ${id}`);
      
      try {
        const res = await apiFetch('/map/harvest', {
          method: 'POST',
          body: JSON.stringify({ sectorId, nodeId: id }),
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log(`[RESOURCE SYSTEM] Received: +${data.amount} ${data.mined}`);
          
          // Mark this specific node as harvested in local session state
          harvestNode(id);
          
          // Update global remaining resource counts and harvested list from server response
          if (data.remainingQty !== undefined && data.capacity !== undefined) {
            setResources(data.remainingQty, data.capacity, data.harvested || []);
          }
          
          // Notify other components (like PlayerHUD) to refresh inventory
          window.dispatchEvent(new CustomEvent('inventory-updated'));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.message || 'Harvest failed.');
        }
      } catch (err) {
        console.error(`[RESOURCE SYSTEM] API error`, err);
        alert('Failed to connect to server. Resource not harvested.');
      }
    }
  };

  // Pulse animation for active crystals
  useFrame((state) => {
    if (!isDepleted && crystalRef.current) {
      const material = crystalRef.current.material as MeshStandardMaterial;
      // Oscillate emissive intensity between 0.2 and 1.0
      material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.4;
    }
  });

  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <group scale={[scale, scale, scale]}>
        {/* The targetable trigger mesh (slightly larger than visual) */}
        {!isDepleted && (
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
            color={isDepleted ? '#333333' : '#00FF9D'}
            emissive={isDepleted ? '#000000' : '#00FF9D'}
            emissiveIntensity={isDepleted ? 0 : 0.8}
            roughness={isDepleted ? 0.9 : 0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Small adjacent crystal */}
        <mesh castShadow receiveShadow position={[0.8, 0.5, 0.5]} rotation={[0.2, 0.5, -0.4]} scale={0.7}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={isDepleted ? '#222222' : '#00FF9D'}
            emissive={isDepleted ? '#000000' : '#00FF9D'}
            emissiveIntensity={isDepleted ? 0 : 0.5}
            roughness={isDepleted ? 0.9 : 0.2}
            metalness={0.8}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
