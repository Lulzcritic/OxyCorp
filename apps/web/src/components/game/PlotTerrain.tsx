/**
 * Plot Terrain Component
 * 
 * Procedurally generated land for agricultural or resource plots.
 * Generates rolling hills and dynamically places harvestable resource nodes
 * across the surface based on the terrain seed.
 */

import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RigidBody, HeightfieldCollider } from '@react-three/rapier';
import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';
import ResourceNode from './ResourceNode';

interface PlotTerrainProps {
  seed: number;
  size?: number;
  resolution?: number;
  numResources?: number;
  isOwned: boolean;
}


// Simple seeded random generator
export function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Logic for computing plot terrain height
function getTerrainHeight(x: number, z: number, noise2D: any, size: number) {
  // Base rolling hills
  let noiseVal = noise2D(x * 0.02, z * 0.02) * 3.0; // Large hills
  noiseVal += noise2D(x * 0.05, z * 0.05) * 1.5;    // Medium details
  noiseVal += noise2D(x * 0.15, z * 0.15) * 0.3;    // Small bumps

  // Add edge basin so players don't easily fall off
  const center = new THREE.Vector2(0, 0);
  const v = new THREE.Vector2(x, z);
  const distFromCenter = v.distanceTo(center);
  const maxRadius = size / 2;
  const edgeFactor = Math.pow(distFromCenter / maxRadius, 3);
  
  return noiseVal + (edgeFactor * 15);
}

export default function PlotTerrain({ 
  seed, 
  size = 100, 
  resolution = 64,
  numResources = 15,
  isOwned
}: PlotTerrainProps) {
  
  const { noise2D } = useMemo(() => {
    const srng = mulberry32(seed);
    return { noise2D: createNoise2D(srng) };
  }, [seed]);

  // Load terrain textures
  const [diffuseMap, normalMap] = useTexture([
    '/textures/rocky_trail_02_diff_1k.jpg',
    '/textures/generated_normal_map_from_disp.png'
  ]);

  useMemo(() => {
    diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    const repeat = size / 20; // Scale texture appropriately
    diffuseMap.repeat.set(repeat, repeat);
    normalMap.repeat.set(repeat, repeat);
  }, [diffuseMap, normalMap, size]);

  // Procedurally generate terrain and cache physics heights
  const { geometry, heights } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution, resolution);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const posAttribute = geo.attributes.position;
    const heightsArray = new Float32Array((resolution + 1) * (resolution + 1));

    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const z = posAttribute.getZ(i);
      const height = getTerrainHeight(x, z, noise2D, size);

      posAttribute.setY(i, height);

      // Store in column-major order for Rapier Heightfield
      const col = i % (resolution + 1);
      const row = Math.floor(i / (resolution + 1));
      heightsArray[col * (resolution + 1) + row] = height;
    }

    geo.computeVertexNormals();
    return { geometry: geo, heights: Array.from(heightsArray) };
  }, [noise2D, size, resolution]);

  // Procedurally place resource nodes scattered around the plot
  const resourcePlacements = useMemo(() => {
    const nodes = [];
    // Distinct RNG instance solely for resource placement to decouple order dependencies
    const scatterRng = mulberry32(seed + 9999); 
    
    // Attempt to scatter nodes
    for (let i = 0; i < numResources; i++) {
      // Pick random X/Z within bounds
      const spawnRange = size * 0.4; // Keep away from extreme edges
      const rx = (scatterRng() * 2 - 1) * spawnRange;
      const rz = (scatterRng() * 2 - 1) * spawnRange;
      
      // Look up perfect Y placement using exact noise calculation
      const ry = getTerrainHeight(rx, rz, noise2D, size);
      
      nodes.push({
        id: `plot_${seed}_ore_${i}`,
        position: [rx, ry, rz] as [number, number, number],
        rotation: [scatterRng() * 0.4, scatterRng() * Math.PI, scatterRng() * 0.4] as [number, number, number],
        scale: 0.5 + scatterRng() * 1.5, // Randomly sized clusters
      });
    }
    return nodes;
  }, [seed, noise2D, size, numResources]);

  return (
    <group>
      {/* Terrain Visual */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          map={diffuseMap}
          normalMap={normalMap}
          color="#aa7755" // Slightly earthier Mars tone for farming
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Physics Collider */}
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <HeightfieldCollider
          args={[
            resolution,
            resolution,
            heights,
            { x: size, y: 1, z: size } 
          ]}
        />
      </RigidBody>

      {/* Renders Seeded Resource Nodes */}
      {resourcePlacements.map((props) => (
        <ResourceNode key={props.id} {...props} isOwned={isOwned} />
      ))}
    </group>
  );
}
