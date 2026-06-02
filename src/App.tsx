import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import ClickerPage from './pages/ClickerPage'
import TiendaPage from './pages/TiendaPage'
import AlbumPage from './pages/AlbumPage'
import AdminRoute from './components/ui/AdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminStats from './pages/admin/AdminStats'
import AdminCartas from './pages/admin/AdminCartas'
import AdminSobres from './pages/admin/AdminSobres'
import AdminAlbums from './pages/admin/AdminAlbums'
import InventarioPage from './pages/InventarioPage'
import AlbumDetallePage from './pages/AlbumDetallePage'
import { useAutoClicker } from './hooks/useAutoClicker'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function AppContent() {
  useAutoClicker()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/clicker" element={<PrivateRoute><ClickerPage /></PrivateRoute>} />
      <Route path="/tienda" element={<PrivateRoute><TiendaPage /></PrivateRoute>} />
      <Route path="/album" element={<PrivateRoute><AlbumPage /></PrivateRoute>} />
      <Route path="/album/:id" element={<PrivateRoute><AlbumDetallePage /></PrivateRoute>} />
      <Route path="/inventario" element={<PrivateRoute><InventarioPage /></PrivateRoute>} />
      <Route
        path="/admin"
        element={<AdminRoute><AdminLayout /></AdminRoute>}
      >
        <Route index element={<AdminStats />} />
        <Route path="cartas" element={<AdminCartas />} />
        <Route path="sobres" element={<AdminSobres />} />
        <Route path="albums" element={<AdminAlbums />} />
      </Route>
      <Route path="*" element={<Navigate to="/clicker" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App