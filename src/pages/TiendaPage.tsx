import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useSobreStore } from '../store/sobreStore'
import AperturaSobre from '../components/sobre/AperturaSobre'
import Navbar from '../components/ui/Navbar'
import api from '../services/api'
import type { CartaData } from '../components/carta/CartaComponent'

interface Sobre {
  id: string
  nombre: string
  descripcion: string | null
  costo: number
  cantCartas: number
  imagenUrl: string | null
}

export default function TiendaPage() {
  const { puntos, setPuntos } = useAuthStore()
  const { cartasApertura, mostrandoApertura, setApertura, cerrarApertura } = useSobreStore()
  const [sobres, setSobres] = useState<Sobre[]>([])
  const [cargando, setCargando] = useState<string | null>(null)
  const [pities, setPities] = useState<Record<string, { contadorExclusiva: number; contadorSekai: number }>>({})
  const [sobreImagenAbierto, setSobreImagenAbierto] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/sobres').then((r) => setSobres(r.data))
    api.get('/sobres/pity').then((r) => setPities(r.data))
  }, [])

  async function handleAbrirSobre(sobre: Sobre) {
    if (puntos < sobre.costo) {
      setError('No tienes suficientes puntos')
      setTimeout(() => setError(''), 3000)
      return
    }

    setCargando(sobre.id)
    try {
      const { data } = await api.post(`/sobres/${sobre.id}/abrir`)
      setPuntos(data.puntosRestantes)
      setPities((prev) => ({ ...prev, [sobre.id]: data.pity }))
      setSobreImagenAbierto(sobre.imagenUrl ?? null)
      setApertura(data.cartas as CartaData[])
    } catch {
      setError('Error al abrir el sobre')
      setTimeout(() => setError(''), 3000)
    } finally {
      setCargando(null)
    }
  }

  return (
    <>
      <AnimatePresence>
        {mostrandoApertura && (
          <AperturaSobre
            cartas={cartasApertura}
            sobreImagenUrl={sobreImagenAbierto}
            onCerrar={cerrarApertura}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="px-6 py-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Tienda</h1>
            <div className="px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm">
              <span className="text-muted-foreground">Puntos: </span>
              <span className="font-bold">{puntos.toLocaleString()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive-foreground text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-wrap gap-8 justify-center">
            {sobres.map((sobre, i) => (
              <motion.div
                key={sobre.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden w-56"
              >
                {/* Sobre visual */}
                <div
                  className="relative cursor-pointer h-64 flex items-center justify-center"
                  onClick={() => handleAbrirSobre(sobre)}
                >
                  {sobre.imagenUrl ? (
                    <img
                      src={sobre.imagenUrl}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-7xl"
                    >
                      📦
                    </motion.div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm">{sobre.nombre}</h3>
                    {sobre.descripcion && (
                      <p className="text-muted-foreground text-xs mt-0.5">{sobre.descripcion}</p>
                    )}
                    <p className="text-muted-foreground text-xs mt-1">
                      {sobre.cantCartas} cartas por sobre
                    </p>
                  </div>

                  {/* Pity */}
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>Pity EXCLUSIVA</span>
                        <span>{pities[sobre.id]?.contadorExclusiva ?? 0} / 200</span>
                      </div>
                      <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${((pities[sobre.id]?.contadorExclusiva ?? 0) / 200) * 100}%`,
                            background:
                              (pities[sobre.id]?.contadorExclusiva ?? 0) >= 100
                                ? 'linear-gradient(90deg, #a855f7, #ec4899)'
                                : '#6366f1',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>Pity SEKAI</span>
                        <span>{pities[sobre.id]?.contadorSekai ?? 0} / 500</span>
                      </div>
                      <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${((pities[sobre.id]?.contadorSekai ?? 0) / 500) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {sobre.costo.toLocaleString()} pts
                    </span>
                    <button
                      onClick={() => handleAbrirSobre(sobre)}
                      disabled={cargando === sobre.id || puntos < sobre.costo}
                      className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-40 hover:bg-primary/80 transition-colors text-sm"
                    >
                      {cargando === sobre.id ? 'Abriendo...' : 'Abrir'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        <Navbar />
      </div>
    </>
  )
}