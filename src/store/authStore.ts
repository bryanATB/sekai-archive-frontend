import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  usuarioId: string | null
  puntos: number
  esAdmin: boolean
  setAuth: (token: string, usuarioId: string, esAdmin: boolean) => void
  setPuntos: (puntos: number) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuarioId: null,
      puntos: 0,
      esAdmin: false,
      setAuth: (token, usuarioId, esAdmin) => set({ token, usuarioId, esAdmin }),
      setPuntos: (puntos) => set({ puntos }),
      logout: () => set({ token: null, usuarioId: null, puntos: 0, esAdmin: false }),
    }),
    { name: 'sekai-auth' }
  )
)