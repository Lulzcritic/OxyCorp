
import { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { useTexture } from '@react-three/drei';
import { mulberry32 } from '../utils/seed';

export default function MiningTerrain({ seedMining }: { seedMining: string }) {
  const textures = useTexture({
    map: '/textures/rocky_trail_02_diff_1k.jpg',
    normalMap: '/textures/generated_normal_map_from_disp.png'
  });

  Object.values(textures).forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20); // ajuster à la taille de ta map
  });

  const geometry = useMemo(() => {
    const size = 300;
    const segments = 128;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);

    // Générateur seedé
    const seed = seedMining;
    const hash = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const random = mulberry32(hash);
    const noise2D = createNoise2D(random);

    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);

        const mountainNoise =
            noise2D(x * 0.02, y * 0.02) * 4 +
            noise2D(x * 0.1, y * 0.1) * 1.2;

        pos.setZ(i, mountainNoise);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);


  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial
        {...textures}
        roughness={1}
      />
    </mesh>
  );
}
