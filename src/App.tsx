import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import World from './scenes/World';

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <World />
      </Suspense>
    </Canvas>
  );
}
