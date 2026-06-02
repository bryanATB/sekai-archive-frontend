import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/ui/Navbar'
import api from '../services/api'
import type { CartaData } from '../components/carta/CartaComponent'

interface EntradaInventario {
  cartaId: string
  cantidad: number
  copias: number
  precioVenta: number
  carta: CartaData
}

const RAREZA_COLOR: Record<string, string> = {
  COMUN: 'text-gray-400',
  RARA: 'text-blue-400',
  EPICA: 'text-purple-400',
  MITICA: 'text-red-400',
  LEGENDARIA: 'text-yellow-400',
  SECRETA: 'text-rose-400',
  EXCLUSIVA: 'text-cyan-400',
  SEKAI: 'text-amber-300',
}

export default function InventarioPage() {
  const { setPuntos } = useAuthStore()
  const [inventario, setInventario] = useState<EntradaInventario[]>([])
  const [cargando, setCargando] = useState(true)
  const [vendiendo, setVendiendo] = useState<string | null>(null)
  const [cartaSeleccionada, setCartaSeleccionada] = useState<EntradaInventario | null>(null)
  const [cantidadVender, setCantidadVender] = useState(1)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarInventario()
  }, [])

  async function cargarInventario() {
    const { data } = await api.get('/inventario')
    setInventario(data)
    setCargando(false)
  }

  function abrirVenta(entrada: EntradaInventario) {
    setCartaSeleccionada(entrada)
    setCantidadVender(1)
    setMensaje('')
  }

  async function handleVender() {
    if (!cartaSeleccionada) return
    setVendiendo(cartaSeleccionada.cartaId)
    try {
      const { data } = await api.post(
        `/inventario/${cartaSeleccionada.cartaId}/vender`,
        { cantidad: cantidadVender },
      )
      setPuntos(data.puntosActuales)
      setMensaje(`+${data.puntosGanados} puntos`)
      await cargarInventario()
      setTimeout(() => {
        setCartaSeleccionada(null)
        setMensaje('')
      }, 1500)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Error al vender'
      setMensaje(msg)
    } finally {
      setVendiendo(null)
    }
  }

  const soloRepetidas = inventario.filter((e) => e.copias > 0)
  const todas = inventario

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando inventario...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 py-5 border-b border-border/50">
        <h1 className="text-xl font-bold">Inventario</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {todas.length} cartas · {soloRepetidas.length} con copias para vender
        </p>
      </header>

      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {soloRepetidas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <span className="text-6xl opacity-20">📦</span>
            <p className="text-muted-foreground text-center">
              No tienes cartas repetidas.<br />¡Sigue abriendo sobres!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {soloRepetidas.map((entrada, i) => (
              <motion.div
                key={entrada.cartaId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 bg-card border border-border rounded-xl p-4"
              >
                <img
                  src={entrada.carta.imagenUrl}
                  alt={entrada.carta.nombre}
                  className="w-14 h-14 rounded-xl object-cover bg-secondary shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{entrada.carta.nombre}</p>
                  <p className={`text-xs font-medium ${RAREZA_COLOR[entrada.carta.rareza]}`}>
                    {entrada.carta.rareza}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {entrada.copias} copia{entrada.copias > 1 ? 's' : ''} · {entrada.precioVenta} pts c/u
                  </p>
                </div>
                <button
                  onClick={() => abrirVenta(entrada)}
                  className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-xl hover:bg-primary/20 transition-colors shrink-0"
                >
                  Vender
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal venta */}
      <AnimatePresence>
        {cartaSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartaSeleccionada(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={cartaSeleccionada.carta.imagenUrl}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold">{cartaSeleccionada.carta.nombre}</p>
                  <p className={`text-sm ${RAREZA_COLOR[cartaSeleccionada.carta.rareza]}`}>
                    {cartaSeleccionada.carta.rareza}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {cartaSeleccionada.copias} copia{cartaSeleccionada.copias > 1 ? 's' : ''} disponibles
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">
                  ¿Cuántas copias vender?
                </label>

                {/* Botones rápidos */}
                <div className="flex gap-2 mb-3">
                  {[1, 5, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCantidadVender(Math.min(n, cartaSeleccionada.copias))}
                      disabled={cartaSeleccionada.copias < n}
                      className="flex-1 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-secondary/80 disabled:opacity-30 transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setCantidadVender(cartaSeleccionada.copias)}
                    className="flex-1 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Todas ({cartaSeleccionada.copias})
                  </button>
                </div>

                {/* Control manual */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCantidadVender((c) => Math.max(1, c - 1))}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg font-bold hover:bg-secondary/80 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={cartaSeleccionada.copias}
                    value={cantidadVender}
                    onChange={(e) => {
                      const val = Math.min(
                        Math.max(1, Number(e.target.value)),
                        cartaSeleccionada.copias,
                      )
                      setCantidadVender(val)
                    }}
                    className="flex-1 text-center text-2xl font-bold bg-secondary border border-border rounded-xl py-2 focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={() => setCantidadVender((c) => Math.min(cartaSeleccionada.copias, c + 1))}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg font-bold hover:bg-secondary/80 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl px-4 py-3 mb-4 text-center">
                <p className="text-muted-foreground text-sm">Recibirás</p>
                <p className="text-2xl font-bold text-primary">
                  {cantidadVender * cartaSeleccionada.precioVenta} pts
                </p>
              </div>

              {mensaje && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center text-sm mb-3 font-medium ${
                    mensaje.startsWith('+') ? 'text-green-400' : 'text-destructive'
                  }`}
                >
                  {mensaje}
                </motion.p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setCartaSeleccionada(null)}
                  className="flex-1 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVender}
                  disabled={vendiendo === cartaSeleccionada.cartaId}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-50 hover:bg-primary/80 transition-colors text-sm"
                >
                  {vendiendo ? 'Vendiendo...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />
    </div>
  )
}