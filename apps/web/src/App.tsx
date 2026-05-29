import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import AuthPage from './components/AuthPage'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './components/Dashboard'
import WarRoom from './pages/WarRoom'
import Bunker from './pages/Bunker'
import Headquarters from './pages/Headquarters'
import Plot from './pages/Plot'
import { ChatProvider } from './context/ChatContext'
import ChatDrawer from './components/ChatDrawer'

function AuthenticatedLayout() {
  return (
    <ChatProvider>
      <ChatDrawer />
      <Outlet />
    </ChatProvider>
  )
}

export default function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) return <div style={{background: '#050505', color: '#00FF9D', height: '100vh'}}>Booting...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/war-room" element={<WarRoom />} />
          <Route path="/bunker" element={<Bunker />} />
          <Route path="/hq" element={<Headquarters />} />
          <Route path="/plot/:id" element={<Plot />} />
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}
