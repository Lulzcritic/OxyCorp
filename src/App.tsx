import { Canvas } from '@react-three/fiber';
import { useAuth } from './auth/AuthProvider';
import { Suspense } from 'react';
import World from './scenes/World';
import AuthScreen from './auth/AuthScreen';

export default function App() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <AuthScreen onDone={()=>{}} />;
  return (
    <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <World />
      </Suspense>
    </Canvas>
  );
}
