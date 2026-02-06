import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import WarRoom from './pages/WarRoom'
import { ChatProvider } from './context/ChatContext'
import ChatDrawer from './components/ChatDrawer'
import type { Session } from '@supabase/supabase-js'

function AuthenticatedLayout() {
  return (
    <ChatProvider>
      <ChatDrawer />
      <Outlet />
    </ChatProvider>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{background: '#050505', color: '#00FF9D', height: '100vh'}}>Booting...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <AuthPage /> : <Navigate to="/dashboard" />} />
        
        <Route element={session ? <AuthenticatedLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/war-room" element={<WarRoom />} />
        </Route>

        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}
