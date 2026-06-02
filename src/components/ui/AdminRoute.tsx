import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const esAdmin = useAuthStore((s) => s.esAdmin)

  if (!token) return <Navigate to="/login" replace />
  if (!esAdmin) return <Navigate to="/clicker" replace />

  return <>{children}</>
}