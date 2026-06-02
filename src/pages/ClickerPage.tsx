import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, LogOut, Zap, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useMejorasStore } from '../store/mejorasStore'
import Navbar from '../components/ui/Navbar'
import api from '../services/api'
import useSound from 'use-sound'

interface Particula {
  id: number
  x: number
  y: number
}

interface FloatingParticle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

function generarParticulasFlotantes(): FloatingParticle[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }))
}

const FLOATING_PARTICLES = generarParticulasFlotantes()

export default function ClickerPage() {
  const navigate = useNavigate()
  const { puntos, setPuntos, logout } = useAuthStore()
  const { multiplicador, autoClicker, setMejoras } = useMejorasStore()
  const [particulas, setParticulas] = useState<Particula[]>([])
  const [presionado, setPresionado] = useState(false)
  const [comprando, setComprando] = useState<string | null>(null)
  const [play] = useSound('/sounds/click.wav', { volume: 0.4 })

  const floatingParticles = FLOATING_PARTICLES

  useEffect(() => {
    api.post('/clicker/puntos').then((r) => setPuntos(r.data.puntos))
    api.get('/mejoras').then((r) => setMejoras(r.data))
  }, [setPuntos, setMejoras])

  async function handleClick() {
    const id = Date.now()
    setParticulas((prev) => [...prev, { id, x: 88, y: 88 }])
    setTimeout(() => setParticulas((prev) => prev.filter((p) => p.id !== id)), 600)

    setPresionado(true)
    setTimeout(() => setPresionado(false), 100)
    play()

    const ptsClick = multiplicador?.puntosClick ?? 1
    setPuntos(puntos + ptsClick)

    api.post('/clicker/click').then((r) => setPuntos(r.data.puntos)).catch(() => {})
  }

  async function handleComprar(tipo: 'MULTIPLICADOR' | 'AUTO_CLICKER') {
    setComprando(tipo)
    try {
      const { data } = await api.post('/mejoras/comprar', { tipo })
      setPuntos(data.puntosActuales)
      const { data: mejoras } = await api.get('/mejoras')
      setMejoras(mejoras)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Error al comprar'
      alert(msg)
    } finally {
      setComprando(null)
    }
  }

  function handleLogout() {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  const ptsClick = multiplicador?.puntosClick ?? 1
  const ptsSegundo = autoClicker?.puntosPorSegundo ?? 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              willChange: 'transform, opacity',
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-border/50 backdrop-blur-sm bg-background/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sekai Archive</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary/50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10 px-4">
        {/* Stats rápidos */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <Zap className="w-3 h-3 text-primary" />
            <span>{ptsClick} pts/click</span>
          </div>
          {ptsSegundo > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <Clock className="w-3 h-3 text-green-400" />
              <span>{ptsSegundo} pts/seg</span>
            </div>
          )}
        </div>

        {/* Puntos */}
        <div className="text-center">
          <motion.div
            key={puntos}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <span className="text-7xl sm:text-8xl font-bold tabular-nums bg-gradient-to-b from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
              {puntos.toLocaleString()}
            </span>
            <div className="absolute inset-0 text-7xl sm:text-8xl font-bold tabular-nums text-primary/20 blur-xl -z-10">
              {puntos.toLocaleString()}
            </div>
          </motion.div>
          <p className="text-muted-foreground mt-3 text-sm font-medium tracking-widest uppercase">
            puntos
          </p>
        </div>

        {/* Botón */}
        <div className="relative">
          <motion.div
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 blur-xl"
            animate={{ scale: presionado ? 1.3 : 1, opacity: presionado ? 0.8 : 0.4 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border border-primary/30"
            animate={{ scale: presionado ? 1.1 : 1, opacity: presionado ? 0.5 : 0.3 }}
          />
          <motion.button
            onClick={handleClick}
            animate={presionado ? { scale: 0.92 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-primary via-accent to-primary shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-shadow duration-300 flex items-center justify-center select-none cursor-pointer overflow-visible"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/10" />
            <motion.div
              animate={{ rotate: presionado ? 15 : 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative z-10"
            >
              <svg className="w-16 h-16 sm:w-20 sm:h-20 text-primary-foreground drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.09 8.26L20.73 9.27L15.87 14.14L17.18 20.78L12 17.77L6.82 20.78L8.13 14.14L3.27 9.27L9.91 8.26L12 2Z" />
              </svg>
            </motion.div>
            <AnimatePresence>
              {particulas.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, x: p.x - 88, y: p.y - 88, scale: 1 }}
                  animate={{ opacity: 0, y: p.y - 180, scale: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute text-yellow-300 text-xl font-bold pointer-events-none drop-shadow-glow"
                  style={{ left: 0, top: 0 }}
                >
                  +{ptsClick}
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.button>
          <AnimatePresence>
            {presionado && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full bg-primary pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Mejoras */}
        <div className="w-full max-w-sm space-y-3">
          {/* Multiplicador */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Multiplicador de clicks</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Nv. {multiplicador?.nivelActual ?? 0} / {multiplicador?.maxNivel ?? 5}
              </span>
            </div>

            {/* Barra de nivel */}
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${((multiplicador?.nivelActual ?? 0) / (multiplicador?.maxNivel ?? 5)) * 100}%`,
                }}
              />
            </div>

            {multiplicador?.siguiente ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Siguiente: {multiplicador.siguiente.puntosClick} pts/click
                </span>
                <button
                  onClick={() => handleComprar('MULTIPLICADOR')}
                  disabled={comprando === 'MULTIPLICADOR' || puntos < multiplicador.siguiente.costo}
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-primary/80 transition-colors"
                >
                  {comprando === 'MULTIPLICADOR'
                    ? '...'
                    : `${multiplicador.siguiente.costo.toLocaleString()} pts`}
                </button>
              </div>
            ) : (
              <p className="text-xs text-center text-green-400 font-medium">✦ Nivel máximo</p>
            )}
          </div>

          {/* Auto-clicker */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="font-medium text-sm">Auto-clicker</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Nv. {autoClicker?.nivelActual ?? 0} / {autoClicker?.maxNivel ?? 5}
              </span>
            </div>

            <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width: `${((autoClicker?.nivelActual ?? 0) / (autoClicker?.maxNivel ?? 5)) * 100}%`,
                }}
              />
            </div>

            {autoClicker?.siguiente ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Siguiente: {autoClicker.siguiente.puntosPorSegundo} pts/seg
                </span>
                <button
                  onClick={() => handleComprar('AUTO_CLICKER')}
                  disabled={comprando === 'AUTO_CLICKER' || puntos < autoClicker.siguiente.costo}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-green-500 transition-colors"
                >
                  {comprando === 'AUTO_CLICKER'
                    ? '...'
                    : `${autoClicker.siguiente.costo.toLocaleString()} pts`}
                </button>
              </div>
            ) : (
              <p className="text-xs text-center text-green-400 font-medium">✦ Nivel máximo</p>
            )}
          </div>
        </div>
      </main>

      <Navbar />
    </div>
  )
}