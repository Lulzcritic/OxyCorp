// components/MartianTerrain.tsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { useTexture } from '@react-three/drei';

export default function MartianTerrain() {
  const textures = useTexture({
    map: '/textures/rocky_trail_02_diff_1k.jpg',
    normalMap: '/textures/generated_normal_map_from_disp.png'
  });

  Object.values(textures).forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20); // ajuster à la taille de ta map
  });

  // Générateur pseudo-aléatoire avec seed
  function mulberry32(seed: number) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const geometry = useMemo(() => {
    const size = 300;
    const segments = 128;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);

    // Générateur seedé
    const seed = 'marsbase42';
    const hash = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const random = mulberry32(hash);
    const noise2D = createNoise2D(random);

    const pos = geo.attributes.position;
    const center = new THREE.Vector2(0, 0);
    const craterRadius = 50;
    const craterDepth = 1;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const point = new THREE.Vector2(x, y);
      const distToCenter = point.distanceTo(center);

      let elevation = 0;

      if (distToCenter < craterRadius) {
        const t = distToCenter / craterRadius;
        const rim = Math.pow(t, 5);
        elevation = -craterDepth * (1 - rim);
      } else {
        const falloff = (distToCenter - craterRadius) / (size * 0.5 - craterRadius);
        const mountainNoise =
          noise2D(x * 0.02, y * 0.02) * 4 +
          noise2D(x * 0.1, y * 0.1) * 1.2;

        const valleyShape = -Math.pow(falloff, 1.5) * 2;
        elevation = mountainNoise + valleyShape;
      }

      pos.setZ(i, elevation);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);


  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow>
      <meshStandardMaterial
        {...textures}
        roughness={1}
      />
    </mesh>
  );
}
