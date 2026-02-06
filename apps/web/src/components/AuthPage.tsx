import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050505' }}>
      <div style={{ width: '400px', padding: '20px', border: '1px solid #333', background: '#111' }}>
        <h2 style={{ color: '#00FF9D', textAlign: 'center', fontFamily: 'monospace' }}>MOLOCH PROTOCOL</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#00FF9D', brandAccent: '#00cc7d' } } } }}
          providers={['discord']}
          theme="dark"
        />
      </div>
    </div>
  )
}
