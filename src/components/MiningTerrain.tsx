import { useMemo, forwardRef } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { useTexture } from '@react-three/drei';
import { mulberry32 } from '../utils/seed';

type RoadOrientation = 'x' | 'y';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

const MiningTerrain = forwardRef<THREE.Mesh, {
  seedMining: string;
  roadOrientation?: RoadOrientation;
  roadWidth?: number;
  roadShoulder?: number;
  roadHeightMode?: 'auto' | 'zero' | number;
}>(
function MiningTerrain({
  seedMining,
  roadOrientation = 'y',
  roadWidth = 10,
  roadShoulder = 6,
  roadHeightMode = 'auto',
}, ref) {
  const textures = useTexture({
    map: '/textures/rocky_trail_02_diff_1k.jpg',
    normalMap: '/textures/generated_normal_map_from_disp.png'
  });

  Object.values(textures).forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
  });

  const geometry = useMemo(() => {
    const size = 300;
    const segments = 128;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);

    // Générateur seedé
    if (!seedMining) return null;
    const hash = Array.from(seedMining).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const random = mulberry32(hash);
    const noise2D = createNoise2D(random);

    const pos = geo.attributes.position;
    const heights = new Float32Array(pos.count);

    // Hauteur naturelle
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const h =
        noise2D(x * 0.02, y * 0.02) * 4 +
        noise2D(x * 0.1, y * 0.1) * 1.2;

      heights[i] = h;
    }

    // Hauteur route
    let roadHeight = 0;
    if (typeof roadHeightMode === 'number') {
      roadHeight = roadHeightMode;
    } else if (roadHeightMode === 'zero') {
      roadHeight = 0;
    } else {
      const centerHalfBand = 0.5;
      let sum = 0;
      let count = 0;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const d = roadOrientation === 'y' ? Math.abs(x) : Math.abs(y);
        if (d <= centerHalfBand) {
          sum += heights[i];
          count++;
        }
      }
      roadHeight = count > 0 ? sum / count : 0;
    }

    // Carving route
    const halfFlat = roadWidth * 0.5;
    const halfBlend = halfFlat + roadShoulder;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const baseH = heights[i];
      const d = roadOrientation === 'y' ? Math.abs(x) : Math.abs(y);

      let finalH = baseH;
      if (d <= halfFlat) {
        finalH = roadHeight;
      } else if (d <= halfBlend) {
        const t = smoothstep(halfFlat, halfBlend, d);
        finalH = THREE.MathUtils.lerp(roadHeight, baseH, t);
      }

      pos.setZ(i, finalH);
    }

    geo.computeVertexNormals();
    return geo;
  }, [seedMining, roadOrientation, roadWidth, roadShoulder, roadHeightMode]);

  return (
    <mesh ref={ref} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial {...textures} roughness={1} />
    </mesh>
  );
});

export default MiningTerrain;
