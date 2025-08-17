import { Canvas } from '@react-three/fiber';
import { useAuth } from './auth/AuthProvider';
import { Suspense, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import World from './scenes/World';
import AuthScreen from './auth/AuthScreen';

export default function App() {
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<{ username: string; skin: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (!session?.user) return setProfile(null);
      const { data } = await supabase
        .from('profiles')
        .select('username, skin')
        .eq('id', session.user.id)
        .maybeSingle();
      setProfile(data ?? { username: 'anon', skin: 'default' });
    })();
  }, [session?.user?.id]);

  if (loading) return null;
  if (!session) return <AuthScreen onDone={()=>{}} />;

  const self = profile && session.user
    ? { id: session.user.id, username: profile.username, skin: profile.skin }
    : null;

  return (
    <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <World self={self} />
      </Suspense>
    </Canvas>
  );
}
