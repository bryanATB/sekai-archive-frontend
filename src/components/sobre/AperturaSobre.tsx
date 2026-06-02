import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'
import type { CartaData } from '../carta/CartaComponent'

interface Props {
  cartas: CartaData[]
  sobreImagenUrl?: string | null
  onCerrar: () => void
}

const RAREZA_ESPECIAL = ['SECRETA', 'EXCLUSIVA', 'SEKAI']

const RAREZA_EFECTO: Record<string, { color: string; glow: string; particulas: string }> = {
  SECRETA:   { color: '#fb7185', glow: 'rgba(251,113,133,0.6)', particulas: '#fb7185' },
  EXCLUSIVA: { color: '#67e8f9', glow: 'rgba(103,232,249,0.6)', particulas: '#67e8f9' },
  SEKAI:     { color: '#fcd34d', glow: 'rgba(252,211,77,0.7)',  particulas: '#fcd34d' },
}

const RAREZA_COLOR_BORDE: Record<string, string> = {
  COMUN:      '#9ca3af',
  RARA:       '#60a5fa',
  EPICA:      '#c084fc',
  MITICA:     '#dc2626',
  LEGENDARIA: '#fbbf24',
  SECRETA:    '#fb7185',
  EXCLUSIVA:  '#67e8f9',
  SEKAI:      '#fcd34d',
}

const RAREZA_ORDEN: Record<string, number> = {
  SEKAI: 8, EXCLUSIVA: 7, SECRETA: 6, LEGENDARIA: 5,
  MITICA: 4, EPICA: 3, RARA: 2, COMUN: 1,
}

interface Particula {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

function generarParticulas(color: string, cantidad = 20): Particula[] {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: i,
    x: 50,
    y: 50,
    vx: (Math.random() - 0.5) * 200,
    vy: (Math.random() - 0.5) * 200,
    size: Math.random() * 6 + 2,
    color,
  }))
}

let audioCtx: AudioContext | null = null

function getAudioContext() {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playImpactoSound() {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Golpe bajo inicial — impacto físico
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(100, now)
  osc1.frequency.exponentialRampToValueAtTime(20, now + 0.35)
  gain1.gain.setValueAtTime(1.0, now)
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  osc1.start(now)
  osc1.stop(now + 0.35)

  // Sub bass que retumba
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.connect(gain2)
  gain2.connect(ctx.destination)
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(45, now)
  osc2.frequency.exponentialRampToValueAtTime(15, now + 0.6)
  gain2.gain.setValueAtTime(0.6, now)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
  osc2.start(now)
  osc2.stop(now + 0.6)

  // Ruido de impacto inicial
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5)
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.6, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.setValueAtTime(500, now)
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noise.start(now)

  // Glitch — pulsos erráticos más intensos y variados
  const tiemposGlitch = [
    { t: 0.04, vol: 0.5, freq: 1200 },
    { t: 0.07, vol: 0.4, freq: 4000 },
    { t: 0.10, vol: 0.6, freq: 800 },
    { t: 0.13, vol: 0.3, freq: 6000 },
    { t: 0.17, vol: 0.5, freq: 2000 },
    { t: 0.20, vol: 0.4, freq: 500 },
    { t: 0.24, vol: 0.3, freq: 3500 },
    { t: 0.28, vol: 0.5, freq: 900 },
    { t: 0.32, vol: 0.2, freq: 7000 },
    { t: 0.36, vol: 0.3, freq: 1500 },
    { t: 0.40, vol: 0.15, freq: 2500 },
  ]

  tiemposGlitch.forEach(({ t, vol, freq }) => {
    const bufSize = Math.floor(ctx.sampleRate * (0.02 + Math.random() * 0.03))
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) {
      d[i] = Math.random() * 2 - 1
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, now + t)
    g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.04)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = 3 + Math.random() * 8
    src.connect(filter)
    filter.connect(g)
    g.connect(ctx.destination)
    src.start(now + t)
  })

  // Tono digital que se corrompe y cae
  const oscGlitch = ctx.createOscillator()
  const gainGlitch = ctx.createGain()
  oscGlitch.connect(gainGlitch)
  gainGlitch.connect(ctx.destination)
  oscGlitch.type = 'square'
  oscGlitch.frequency.setValueAtTime(880, now + 0.04)
  oscGlitch.frequency.setValueAtTime(440, now + 0.08)
  oscGlitch.frequency.setValueAtTime(1760, now + 0.11)
  oscGlitch.frequency.setValueAtTime(220, now + 0.15)
  oscGlitch.frequency.setValueAtTime(1320, now + 0.19)
  oscGlitch.frequency.setValueAtTime(110, now + 0.23)
  oscGlitch.frequency.setValueAtTime(660, now + 0.27)
  oscGlitch.frequency.exponentialRampToValueAtTime(30, now + 0.5)
  gainGlitch.gain.setValueAtTime(0.0, now)
  gainGlitch.gain.linearRampToValueAtTime(0.25, now + 0.05)
  gainGlitch.gain.setValueAtTime(0.25, now + 0.05)
  gainGlitch.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
  oscGlitch.start(now + 0.04)
  oscGlitch.stop(now + 0.5)

  // Eco digital — el glitch resuena
  const oscEco = ctx.createOscillator()
  const gainEco = ctx.createGain()
  const distortion = ctx.createWaveShaper()
  const curve = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1
    curve[i] = (Math.PI + 400) * x / (Math.PI + 400 * Math.abs(x))
  }
  distortion.curve = curve
  oscEco.connect(distortion)
  distortion.connect(gainEco)
  gainEco.connect(ctx.destination)
  oscEco.type = 'sawtooth'
  oscEco.frequency.setValueAtTime(55, now + 0.1)
  oscEco.frequency.exponentialRampToValueAtTime(25, now + 0.8)
  gainEco.gain.setValueAtTime(0, now)
  gainEco.gain.linearRampToValueAtTime(0.3, now + 0.12)
  gainEco.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
  oscEco.start(now + 0.1)
  oscEco.stop(now + 0.8)
}

interface CarruselProps {
  cartas: CartaData[]
  rarezaColorBorde: Record<string, string>
  rarezaEspecial: string[]
  saltado?: boolean
  onCerrar: () => void
}

function Carrusel({ cartas, rarezaColorBorde, rarezaEspecial, saltado, onCerrar }: CarruselProps) {
  const [indice, setIndice] = useState(0)
  const [mostradas, setMostradas] = useState<boolean[]>(new Array(cartas.length).fill(false))
  const [volandoAlbum, setVolandoAlbum] = useState<number | null>(null)
  const [cartaSeleccionada, setCartaSeleccionada] = useState<CartaData | null>(null)
  const [listas, setListas] = useState(false)

  const [playFlip] = useSound('/sounds/carta-flip.wav', { volume: 0.5 })
  const [playRareza] = useSound('/sounds/rareza-alta.wav', { volume: 0.6 })

  // Mostrar cartas una a una al entrar
  useEffect(() => {
    if (saltado) {
      const ids = cartas.map((_, i) => i)
      ids.forEach((i) => {
        setTimeout(() => {
          setMostradas((prev) => {
            const n = [...prev]
            n[i] = true
            return n
          })
          if (i === cartas.length - 1) {
            setTimeout(() => setListas(true), 600)
          }
        }, i * 100)
      })
      return
    }

    cartas.forEach((_, i) => {
      setTimeout(() => {
        setMostradas((prev) => {
          const nuevo = [...prev]
          nuevo[i] = true
          return nuevo
        })

        const carta = cartas[i]
        const esEspecial = rarezaEspecial.includes(carta.rareza)

        if (i === 0) {
          // Primera carta — la de mayor rareza
          if (esEspecial) {
            playRareza()
            playImpactoSound()
          } else {
            playFlip()
          }
        } else {
          playFlip()
        }

        if (i === cartas.length - 1) {
          setTimeout(() => setListas(true), 600)
        }
      }, i * 400)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saltado])

  async function handleCerrar() {
    // Enviar todas las nuevas al álbum antes de cerrar
    for (let i = 0; i < cartas.length; i++) {
      if (cartas[i].fueNueva) {
        setVolandoAlbum(i)
        await new Promise((r) => setTimeout(r, 200))
      }
    }
    setTimeout(onCerrar, 600)
  }

  // Precalcula siempre los 3 índices
  const indiceIzq = (indice - 1 + cartas.length) % cartas.length
  const indiceCentro = indice
  const indiceDer = (indice + 1) % cartas.length

  // Las 3 cartas siempre montadas, solo cambia su apariencia
  const slots = [
    { cartaIdx: indiceIzq, posicion: 0 },
    { cartaIdx: indiceCentro, posicion: 1 },
    { cartaIdx: indiceDer, posicion: 2 },
  ]

  return (
    <>
      {/* Modal inspección */}
      <AnimatePresence>
        {cartaSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartaSeleccionada(null)}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-4 max-w-xs w-full"
            >
              <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-3">
                <img src={cartaSeleccionada.imagenUrl} className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <h3 className="font-bold text-center">{cartaSeleccionada.nombre}</h3>
              <p className="text-muted-foreground text-sm text-center">{cartaSeleccionada.serie}</p>
              {cartaSeleccionada.descripcion && (
                <p className="text-foreground/70 text-xs text-center mt-2 italic">"{cartaSeleccionada.descripcion}"</p>
              )}
              <button
                onClick={() => setCartaSeleccionada(null)}
                className="w-full mt-3 py-2 rounded-xl bg-secondary text-sm font-medium"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carrusel */}
      <div
        className="flex items-center justify-center gap-4 w-full"
        style={{ minHeight: '320px', willChange: 'transform' }}
      >
        {slots.map(({ cartaIdx, posicion }) => {
          const carta = cartas[cartaIdx]
          const esCentro = posicion === 1
          const esEspecial = rarezaEspecial.includes(carta.rareza)
          const estaMostrada = mostradas[cartaIdx]
          const estaVolando = volandoAlbum === cartaIdx

          return (
            <motion.div
              key={`slot-${posicion}`} // key fija por posición, no por carta
              animate={{
                width: esCentro ? 180 : 120,
                height: esCentro ? 270 : 180,
                opacity: estaVolando ? 0 : esCentro ? 1 : 0.6,
                scale: estaVolando ? 0.1 : estaMostrada ? 1 : 0.8,
                x: estaVolando ? 300 : 0,
                y: estaVolando ? -400 : estaMostrada ? 0 : 20,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative cursor-pointer shrink-0"
              onClick={() => {
                if (!esCentro) {
                  setIndice(cartaIdx)
                } else {
                  setCartaSeleccionada(carta)
                }
              }}
            >
              {/* Flash de impacto */}
              {esEspecial && esCentro && estaMostrada && (
                <motion.div
                  initial={{ opacity: 0.8, scale: 1.5 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                  style={{ background: `radial-gradient(circle, ${rarezaColorBorde[carta.rareza]}60, transparent 70%)` }}
                />
              )}

              {/* Carta */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  border: `2px solid ${rarezaColorBorde[carta.rareza]}`,
                  boxShadow: esEspecial && esCentro
                    ? `0 0 30px ${rarezaColorBorde[carta.rareza]}, 0 0 60px ${rarezaColorBorde[carta.rareza]}40`
                    : `0 0 10px ${rarezaColorBorde[carta.rareza]}30`,
                }}
              >
                <img
                  src={carta.imagenUrl}
                  alt={carta.nombre}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {esCentro && (
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-bold truncate">{carta.nombre}</p>
                    <p className="text-white/60 text-[10px]">{carta.rareza}</p>
                  </div>
                )}

                {carta.fueNueva && esCentro && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                    className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    NUEVA
                  </motion.div>
                )}

                {esEspecial && esCentro && estaMostrada && (
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${rarezaColorBorde[carta.rareza]}25, transparent 70%)` }}
                  />
                )}
              </div>

              {esCentro && estaMostrada && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground text-[10px] whitespace-nowrap">
                  Toca para inspeccionar
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Navegación */}
      <div className="flex items-center gap-6 mt-8">
        <button
          onClick={() => setIndice((i) => (i - 1 + cartas.length) % cartas.length)}
          className="p-3 rounded-full bg-card border border-border hover:bg-secondary/50 transition-colors"
        >
          ‹
        </button>
        <div className="flex gap-1.5">
          {cartas.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndice(i)}
              className={`rounded-full transition-all ${
                i === indice ? 'w-4 h-2 bg-primary' : 'w-2 h-2 bg-border'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setIndice((i) => (i + 1) % cartas.length)}
          className="p-3 rounded-full bg-card border border-border hover:bg-secondary/50 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Botón cerrar */}
      {listas && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleCerrar}
          className="mt-4 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/80 transition-colors"
        >
          ¡Genial!
        </motion.button>
      )}
    </>
  )
}

export default function AperturaSobre({ cartas, sobreImagenUrl, onCerrar }: Props) {
  const [fase, setFase] = useState<'sobre' | 'cartas'>('sobre')
  const [saltado, setSaltado] = useState(false)
  const [playFlipApertura] = useSound('/sounds/carta-flip.wav', { volume: 0.5 })
  const [playRarezaApertura] = useSound('/sounds/rareza-alta.wav', { volume: 0.6 })
  const [sobreAbierto, setSobreAbierto] = useState(false)
  const [sobreSaliendo, setSobreSaliendo] = useState(false)
  const [indiceActual, setIndiceActual] = useState(cartas.length - 1)
  const [cartaRevelada, setCartaRevelada] = useState(false)
  const [animando, setAnimando] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [particulas, setParticulas] = useState<Particula[]>([])
  const [terminado, setTerminado] = useState(false)

  const cartasOrdenadas = [...cartas].sort(
    (a, b) => (RAREZA_ORDEN[b.rareza] ?? 0) - (RAREZA_ORDEN[a.rareza] ?? 0)
  )

  function handleSkip() {
    setSaltado(true)
    setFase('cartas')
    setSobreAbierto(false)
    setSobreSaliendo(false)
  }

  function handleAbrirSobre() {
    if (sobreAbierto) return
    setSobreAbierto(true)
    setTimeout(() => {
      setSobreSaliendo(true)
      setTimeout(() => setFase('cartas'), 800)
    }, 1000)
  }

  function handleClickCarta() {
    if (animando || terminado || saliendo) return

    if (!cartaRevelada) {
      setAnimando(true)
      const carta = cartas[indiceActual]
      const esEspecial = RAREZA_ESPECIAL.includes(carta.rareza)

      playFlipApertura()  // siempre suena el flip

      if (esEspecial) {
        const efecto = RAREZA_EFECTO[carta.rareza]
        setTimeout(() => {
          playRarezaApertura()  // sonido épico cuando se revela
          setFlash(efecto.glow)
          setParticulas(generarParticulas(efecto.particulas, 24))
          setTimeout(() => setFlash(null), 600)
          setTimeout(() => setParticulas([]), 1200)
        }, 400)
      }

      setTimeout(() => {
        setCartaRevelada(true)
        setAnimando(false)
      }, 600)
    } else {
      if (indiceActual === 0) {
        setTerminado(true)
        return
      }

      setSaliendo(true)
      setTimeout(() => {
        setIndiceActual((i) => i - 1)
        setCartaRevelada(false)
        setSaliendo(false)
      }, 350)
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      {/* Flash de rareza especial */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] pointer-events-none"
            style={{ background: flash }}
          />
        )}
      </AnimatePresence>

      {/* Partículas */}
      <AnimatePresence>
        {particulas.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: '50vw', y: '50vh', opacity: 1, scale: 1 }}
            animate={{
              x: `calc(50vw + ${p.vx}px)`,
              y: `calc(50vh + ${p.vy}px)`,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="fixed z-[61] rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Botón skip — esquina superior derecha */}
      {fase === 'sobre' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleSkip}
          className="fixed top-6 right-6 z-[70] flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/70 text-sm font-medium hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
        >
          <span>Saltar</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/>
          </svg>
        </motion.button>
      )}


      {fase === 'sobre' && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-8"
        >
            {/* Sobre visual */}
            <div
              className="relative cursor-pointer"
              style={{ width: '200px', height: '300px' }}
              onClick={handleAbrirSobre}
            >
              {/* Cuerpo */}
              <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl">
                {sobreImagenUrl ? (
                  <img
                    src={sobreImagenUrl}
                    className="w-full h-full object-cover"
                    style={{ clipPath: 'inset(52px 0 0 0)' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Interior */}
                <div
                  className="absolute left-0 right-0 top-0 z-10"
                  style={{
                    height: '52px',
                    background: 'linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 60%, #2d1b4e 100%)',
                  }}
                />
              </div>

              {/* Solapa */}
              <motion.div
                className="absolute left-0 right-0 top-0 z-20 overflow-hidden rounded-t-xl"
                style={{ height: '52px', transformOrigin: 'top center' }}
                whileHover={!sobreAbierto ? { y: -4 } : {}}
                animate={
                  sobreAbierto
                    ? sobreSaliendo
                      ? { y: -120, opacity: 0 }
                      : { y: -8, opacity: 0.7 }
                    : { y: 0, opacity: 1 }
                }
                transition={{ duration: sobreSaliendo ? 0.3 : 0.4 }}
              >
                {sobreImagenUrl && (
                  <img
                    src={sobreImagenUrl}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: sobreImagenUrl ? 'rgba(0,0,0,0.3)' : '#1e1b4b' }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30" />
              </motion.div>

              {/* Brillo al abrir */}
              <AnimatePresence>
                {sobreAbierto && !sobreSaliendo && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.4), transparent 70%)' }}
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-muted-foreground text-sm"
            >
              {sobreAbierto ? 'Abriendo...' : 'Toca el sobre para abrirlo'}
            </motion.p>
          </motion.div>
      )}

      {/* FASE 2 — Cartas apiladas */}
      {fase === 'cartas' && !terminado && !saltado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-8"
        >
            {/* Contador */}
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-bold">{indiceActual + 1}</span>{' '}
              carta{indiceActual + 1 !== 1 ? 's' : ''} restante{indiceActual + 1 !== 1 ? 's' : ''}
            </p>

            {/* Pila */}
            <div
              className="relative"
              style={{ width: '200px', height: '300px' }}
            >
              {/* Cartas de fondo de la pila — siempre neutras sin color de rareza */}
              {Array.from({ length: Math.min(indiceActual, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-2xl border border-white/10"
                  style={{
                    transform: `translateX(${(i + 1) * 4}px) translateY(${(i + 1) * -4}px)`,
                    zIndex: indiceActual - i - 1,
                    background: 'linear-gradient(135deg, #1e1b4b, #0f0f23)',
                    opacity: 1 - i * 0.15,
                  }}
                />
              ))}

              {/* Carta actual */}
              <motion.div
                key={indiceActual}
                className="absolute inset-0 cursor-pointer"
                animate={saliendo ? { x: -300, opacity: 0, rotate: -15 } : { x: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.35, ease: 'easeIn' }}
                style={{ perspective: '1000px', zIndex: 10 }}
                onClick={handleClickCarta}
              >
                <motion.div
                  animate={{ rotateY: cartaRevelada ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  style={{
                    transformStyle: 'preserve-3d',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  {/* Cara oculta — borde SIEMPRE neutro para no dar spoiler */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      border: '2px solid rgba(255,255,255,0.15)',
                      background: 'linear-gradient(135deg, #1e1b4b, #0f0f23)',
                    }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <span className="text-6xl opacity-40">?</span>
                      <p className="text-muted-foreground text-xs">
                        {animando ? '' : 'Toca para revelar'}
                      </p>
                    </div>
                    <div
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 8px)',
                      }}
                    />
                  </div>

                  {/* Cara revelada */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      border: `2px solid ${RAREZA_COLOR_BORDE[cartas[indiceActual]?.rareza ?? 'COMUN']}`,
                      boxShadow: RAREZA_ESPECIAL.includes(cartas[indiceActual]?.rareza)
                        ? `0 0 40px ${RAREZA_COLOR_BORDE[cartas[indiceActual]?.rareza]}, 0 0 80px ${RAREZA_COLOR_BORDE[cartas[indiceActual]?.rareza]}50`
                        : `0 0 20px ${RAREZA_COLOR_BORDE[cartas[indiceActual]?.rareza ?? 'COMUN']}40`,
                    }}
                  >
                    <img
                      src={cartas[indiceActual]?.imagenUrl}
                      alt={cartas[indiceActual]?.nombre}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-sm">{cartas[indiceActual]?.nombre}</p>
                      <p className="text-white/60 text-xs">{cartas[indiceActual]?.rareza}</p>
                    </div>
                    {RAREZA_ESPECIAL.includes(cartas[indiceActual]?.rareza) && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${RAREZA_COLOR_BORDE[cartas[indiceActual]?.rareza]}30, transparent 70%)`,
                        }}
                      />
                    )}
                    {cartaRevelada && !animando && !saliendo && (
                      <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1">
                        <p className="text-white text-[9px]">
                          {indiceActual === 0 ? 'Toca para ver todas' : 'Toca para continuar'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

      {/* FASE 3 — Resumen de todas las cartas */}
      <AnimatePresence>
        {(terminado || saltado) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 w-full px-4"
          >
            <h2 className="text-white text-2xl font-bold">¡Tus cartas!</h2>

            <Carrusel
              cartas={cartasOrdenadas}
              rarezaColorBorde={RAREZA_COLOR_BORDE}
              rarezaEspecial={RAREZA_ESPECIAL}
              saltado={saltado}
              onCerrar={onCerrar}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}