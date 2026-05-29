/**
 * Martian Terrain Component
 * 
 * Generates a procedural crater landscape using a seed and simplex noise.
 * Includes a Rapier heightfield for accurate player collisions.
 */

import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RigidBody, HeightfieldCollider } from '@react-three/rapier';
import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

interface MartianTerrainProps {
  seed?: number;
  size?: number;
  resolution?: number;
}

// Simple seeded random generator
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export default function MartianTerrain({ 
  seed = 42, 
  size = 200, 
  resolution = 128 
}: MartianTerrainProps) {
  
  // Load terrain textures
  const [diffuseMap, normalMap] = useTexture([
    '/textures/rocky_trail_02_diff_1k.jpg',
    '/textures/generated_normal_map_from_disp.png'
  ]);

  // Configure texture repeating
  useMemo(() => {
    diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    const repeat = size / 10;
    diffuseMap.repeat.set(repeat, repeat);
    normalMap.repeat.set(repeat, repeat);
  }, [diffuseMap, normalMap, size]);

  // Generate terrain geometry and heightfield data
  const { geometry, heights } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution, resolution);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const posAttribute = geo.attributes.position;
    const vertexCount = posAttribute.count;

    // Use seeded RNG to initialize simplex noise
    const rng = mulberry32(seed);
    const noise2D = createNoise2D(rng);

    // Heightfield requires row-major array of heights (resolution + 1 x resolution + 1)
    const heightsArray = new Float32Array((resolution + 1) * (resolution + 1));

    const center = new THREE.Vector2(0, 0);
    const maxRadius = size / 2;
    const craterRadius = 40;
    const rimWidth = 20;

    for (let i = 0; i < vertexCount; i++) {
      const x = posAttribute.getX(i);
      const z = posAttribute.getZ(i);
      
      const v = new THREE.Vector2(x, z);
      const distFromCenter = v.distanceTo(center);

      // Base noise for the whole terrain
      // Combine multiple octaves for detail
      let noiseVal = noise2D(x * 0.02, z * 0.02) * 2.0;    // Large hills
      noiseVal += noise2D(x * 0.08, z * 0.08) * 0.5;       // Medium details
      noiseVal += noise2D(x * 0.2, z * 0.2) * 0.1;         // Small bumps

      // Crater shaping math
      let height = 0;
      const craterBaseHeight = -1; // Increased from -5 to reduce depth
      const rimHeight = 5;        // Reduced from 15 to reduce rim height

      if (distFromCenter < craterRadius) {
        // Flat inner crater floor (HQ area)
        height = craterBaseHeight + (noiseVal * 0.3); // Less noise in the center
      } else if (distFromCenter < craterRadius + rimWidth) {
        // Slope up to the rim
        const normalized = (distFromCenter - craterRadius) / rimWidth;
        // Smoothstep curve for the slope
        const factor = normalized * normalized * (3 - 2 * normalized);
        
        height = craterBaseHeight + (rimHeight - craterBaseHeight) * factor + noiseVal;
      } else {
        // Outside the crater - gradual falloff
        const normalizedOut = Math.min(1, (distFromCenter - (craterRadius + rimWidth)) / 40);
        height = rimHeight - (rimHeight * normalizedOut) + noiseVal;
      }

      // Add a slight basin bowl effect across the whole map so edges are higher
      const edgeFactor = Math.pow(distFromCenter / maxRadius, 2);
      height += edgeFactor * 10;

      posAttribute.setY(i, height);

      // Store in heightfield array (Rapier expects column-major order)
      const col = i % (resolution + 1);
      const row = Math.floor(i / (resolution + 1));
      heightsArray[col * (resolution + 1) + row] = height;
    }

    geo.computeVertexNormals();

    return { 
      geometry: geo, 
      heights: Array.from(heightsArray) // Rapier expects regular number array
    };
  }, [seed, size, resolution]);

  return (
    <group>
      {/* Visual Mesh */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          map={diffuseMap}
          normalMap={normalMap}
          color="#aa5544" // Tint texture slightly red/orange for Mars
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Physics Collider */}
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <HeightfieldCollider
          args={[
            resolution,
            resolution,
            heights,
            { x: size, y: 1, z: size } // Scale factors
          ]}
        />
      </RigidBody>
    </group>
  );
}
