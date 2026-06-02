import { create } from 'zustand'
import type { CartaData } from '../components/carta/CartaComponent'

interface SobreStore {
  cartasApertura: CartaData[]
  mostrandoApertura: boolean
  cartasNuevasIds: string[]
  setApertura: (cartas: CartaData[]) => void
  cerrarApertura: () => void
  limpiarCartasNuevas: () => void
}

export const useSobreStore = create<SobreStore>((set) => ({
  cartasApertura: [],
  mostrandoApertura: false,
  cartasNuevasIds: [],
  setApertura: (cartas) =>
  set((state) => ({
    cartasApertura: cartas,
    mostrandoApertura: true,
    cartasNuevasIds: [
      ...state.cartasNuevasIds,
      ...cartas.filter((c) => c.fueNueva).map((c) => c.id),
    ],
  })),
  cerrarApertura: () =>
    set({ cartasApertura: [], mostrandoApertura: false }),
  limpiarCartasNuevas: () => set({ cartasNuevasIds: [] }),
}))