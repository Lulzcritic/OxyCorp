// src/auth/AuthScreen.tsx
import { useState } from 'react';
import { supabase } from '../../supabase/client';

export default function AuthScreen({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string|null>(null);

  const signUp = async () => {
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setError(error.message);
    // créer profil
    const uid = data.user?.id;
    if (uid) {
      const { error: e2 } = await supabase.from('profiles').insert({ id: uid, username });
      if (e2) setError(e2.message);
    }
    onDone();
  };

  const signIn = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message); else onDone();
  };

  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <h2>Connexion</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <input placeholder="username (signup)" value={username} onChange={e=>setUsername(e.target.value)} />
      <div style={{ display:'flex', gap: 8, marginTop: 8 }}>
        <button onClick={signIn}>Se connecter</button>
        <button onClick={signUp}>Créer un compte</button>
      </div>
      {error && <p style={{color:'tomato'}}>{error}</p>}
    </div>
  );
}
