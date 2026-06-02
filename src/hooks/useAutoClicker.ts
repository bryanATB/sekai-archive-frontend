import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useMejorasStore } from '../store/mejorasStore'
import api from '../services/api'

export function useAutoClicker() {
  const token = useAuthStore((s) => s.token)
  const setPuntos = useAuthStore((s) => s.setPuntos)
  const autoClicker = useMejorasStore((s) => s.autoClicker)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Solo correr si hay token y auto-clicker activo
    if (!token || !autoClicker || autoClicker.nivelActual === 0) return

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await api.post('/clicker/tick')
        setPuntos(data.puntos)
      } catch {
        // Silencioso — no interrumpir la experiencia
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [token, autoClicker, setPuntos])
}