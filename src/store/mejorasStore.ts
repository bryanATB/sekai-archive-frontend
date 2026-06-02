import { create } from 'zustand'

interface NivelInfo {
  nivel: number
  puntosClick?: number
  puntosPorSegundo?: number
  costo: number
}

interface MejoraInfo {
  nivelActual: number
  puntosClick?: number
  puntosPorSegundo?: number
  siguiente: NivelInfo | null
  maxNivel: number
}

interface MejorasState {
  multiplicador: MejoraInfo | null
  autoClicker: MejoraInfo | null
  setMejoras: (m: { multiplicador: MejoraInfo; autoClicker: MejoraInfo }) => void
}

export const useMejorasStore = create<MejorasState>((set) => ({
  multiplicador: null,
  autoClicker: null,
  setMejoras: (m) => set({ multiplicador: m.multiplicador, autoClicker: m.autoClicker }),
}))