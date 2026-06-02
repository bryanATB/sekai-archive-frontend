import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import type { CartaData } from '../components/carta/CartaComponent'
import CartaInspeccion from '../components/carta/CartaInspeccion'
import { useSobreStore } from '../store/sobreStore'

interface EntradaAlbum {
  posicion: number
  pegadaEn: string
  carta: CartaData
}

interface AlbumDetalle {
  id: string
  nombre: string
  descripcion: string | null
  totalCartas: number
  imagenUrl: string | null
  entradas: EntradaAlbum[]
  progreso: number
}

const CARTAS_POR_PAGINA = 9
const RAREZA_COLOR: Record<string, string> = {
  COMUN: 'from-gray-600 to-gray-800',
  RARA: 'from-blue-600 to-blue-900',
  EPICA: 'from-purple-600 to-purple-900',
  MITICA: 'from-zinc-800 to-red-900',
  LEGENDARIA: 'from-yellow-500 to-orange-700',
  SECRETA: 'from-rose-500 to-red-800',
  EXCLUSIVA: 'from-cyan-400 to-indigo-700',
  SEKAI: 'from-amber-300 via-pink-500 to-violet-600',
}

export default function AlbumDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [album, setAlbum] = useState<AlbumDetalle | null>(null)
  const [doblePageActual, setDoblePageActual] = useState(0)
  const [direccion, setDireccion] = useState<'derecha' | 'izquierda'>('derecha')
  const [transicionando, setTransicionando] = useState(false)
  const [cartaSeleccionada, setCartaSeleccionada] = useState<EntradaAlbum | null>(null)
  const [cargando, setCargando] = useState(true)
  const { cartasNuevasIds, limpiarCartasNuevas } = useSobreStore()

  const limpiadoRef = useRef(false)
  const [idsNuevos, setIdsNuevos] = useState<string[]>(cartasNuevasIds)

  useEffect(() => {
    return () => {
      limpiadoRef.current = true
      limpiarCartasNuevas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // sin dependencias — solo se ejecuta al desmontar

  // Sincronizar idsNuevos durante el renderizado (React pattern: derived state)
  if (cartasNuevasIds.length > 0 && idsNuevos.length === 0) {
    setIdsNuevos(cartasNuevasIds)
  }

  useEffect(() => {
    api.get('/sobres/albums').then((r) => {
      const encontrado = r.data.find((a: AlbumDetalle) => a.id === id)
      if (encontrado) setAlbum(encontrado)
      setCargando(false)
    })
  }, [id])

  // Cada "doble página" muestra 2 páginas de 9 cartas = 18 cartas
  const totalDoblesPaginas = album
    ? Math.ceil(album.totalCartas / (CARTAS_POR_PAGINA * 2))
    : 0

  function cambiarPagina(nueva: number) {
    if (transicionando || nueva < 0 || nueva >= totalDoblesPaginas) return
    setTransicionando(true)
    setDireccion(nueva > doblePageActual ? 'derecha' : 'izquierda')
    setTimeout(() => {
      setDoblePageActual(nueva)
      setTimeout(() => setTransicionando(false), 250)
    }, 150)
  }

  const cartasDePagina = useCallback(
    (paginaAbsoluta: number) => {
      if (!album) return []
      const inicio = paginaAbsoluta * CARTAS_POR_PAGINA
      return Array.from({ length: CARTAS_POR_PAGINA }, (_, i) => {
        const posicion = inicio + i + 1
        const entrada = album.entradas.find((e) => e.posicion === posicion)
        return { posicion, entrada: entrada ?? null }
      })
    },
    [album],
  )

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando álbum...</p>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Álbum no encontrado</p>
      </div>
    )
  }

  // Páginas izquierda y derecha de la doble página actual
  const paginaIzq = doblePageActual * 2
  const paginaDer = doblePageActual * 2 + 1
  const cartasIzq = cartasDePagina(paginaIzq)
  const cartasDer = cartasDePagina(paginaDer)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border/50 shrink-0">
        <button
          onClick={() => navigate('/album')}
          className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">{album.nombre}</h1>
          <p className="text-muted-foreground text-xs">
            {album.progreso} / {album.totalCartas} cartas
          </p>
        </div>
        <span className="text-muted-foreground text-sm">
          {doblePageActual + 1} / {totalDoblesPaginas}
        </span>
      </header>

      {/* Libro */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-4 gap-4">
        <div
          className="w-full max-w-5xl flex shadow-2xl rounded-2xl overflow-hidden"
          style={{
            opacity: transicionando ? 0 : 1,
            transform: transicionando
              ? `translateX(${direccion === 'derecha' ? '-20px' : '20px'})`
              : 'translateX(0)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
        >
            {/* Página izquierda */}
            <div className="flex-1 bg-card border-r border-border/50 p-4 relative">
              {/* Textura de página */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.1) 28px, rgba(255,255,255,0.1) 29px)',
                }}
              />

              {/* Número de página */}
              <p className="text-xs text-muted-foreground text-left mb-3 font-medium">
                {paginaIzq + 1}
              </p>

              {/* Grid 3x3 */}
              <div className="grid grid-cols-3 gap-5">
                {cartasIzq.map(({ posicion, entrada }) => (
                  <CartaSlot
                    key={posicion}
                    posicion={posicion}
                    entrada={entrada}
                    onClick={() => entrada && setCartaSeleccionada(entrada)}
                    esNueva={entrada ? idsNuevos.includes(entrada.carta.id) : false}
                  />
                ))}
              </div>
            </div>

            {/* Lomo del libro */}
            <div className="w-4 bg-gradient-to-r from-black/20 via-black/5 to-black/20 shrink-0" />

            {/* Página derecha */}
            <div className="flex-1 bg-card border-l border-border/50 p-4 relative">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.1) 28px, rgba(255,255,255,0.1) 29px)',
                }}
              />

              <p className="text-xs text-muted-foreground text-right mb-3 font-medium">
                {paginaDer + 1}
              </p>

              <div className="grid grid-cols-3 gap-5">
                {cartasDer.map(({ posicion, entrada }) => (
                  <CartaSlot
                    key={posicion}
                    posicion={posicion}
                    entrada={entrada}
                    onClick={() => entrada && setCartaSeleccionada(entrada)}
                    esNueva={entrada ? idsNuevos.includes(entrada.carta.id) : false}
                  />
                ))}
              </div>
            </div>
        </div>

        {/* Navegación */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => cambiarPagina(doblePageActual - 1)}
            disabled={doblePageActual === 0 || transicionando}
            className="p-3 rounded-full bg-card border border-border disabled:opacity-30 hover:bg-secondary/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalDoblesPaginas }).map((_, i) => (
              <button
                key={i}
                onClick={() => cambiarPagina(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === doblePageActual ? 'bg-primary w-4' : 'bg-border'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => cambiarPagina(doblePageActual + 1)}
            disabled={doblePageActual === totalDoblesPaginas - 1 || transicionando}
            className="p-3 rounded-full bg-card border border-border disabled:opacity-30 hover:bg-secondary/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Modal inspección carta */}
      <AnimatePresence>
        {cartaSeleccionada && (
          <CartaInspeccion
            carta={cartaSeleccionada.carta}
            pegadaEn={cartaSeleccionada.pegadaEn}
            posicion={cartaSeleccionada.posicion}
            onCerrar={() => setCartaSeleccionada(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente slot de carta
interface CartaSlotProps {
  posicion: number
  entrada: EntradaAlbum | null
  onClick: () => void
  esNueva?: boolean
}


const RAREZA_CONIC: Record<string, string> = {
  COMUN: '#9ca3af, #4b5563, #9ca3af',
  RARA: '#60a5fa, #2563eb, #60a5fa',
  EPICA: '#c084fc, #9333ea, #c084fc',
  MITICA: '#dc2626, #27272a, #dc2626',
  LEGENDARIA: '#fbbf24, #f97316, #fbbf24',
  SECRETA: '#fb7185, #dc2626, #fb7185',
  EXCLUSIVA: '#67e8f9, #6366f1, #67e8f9',
  SEKAI: '#fcd34d, #ec4899, #8b5cf6, #fcd34d',
}

function CartaSlot({ posicion, entrada, onClick, esNueva = false }: CartaSlotProps) {
  // Delay base de 0.6s (espera que termine la animacion del libro) 
  // mas un pequeño escalonado segun posicion
  const delayNueva = 0.6 + (posicion % 9) * 0.08

  return (
    <motion.div
      whileHover={entrada ? { scale: 1.05, zIndex: 10 } : {}}
      onClick={onClick}
      initial={esNueva ? { scale: 0, rotate: -15, opacity: 0 } : false}
      animate={esNueva ? { scale: 1, rotate: 0, opacity: 1 } : {}}
      transition={
        esNueva
          ? { type: 'spring', stiffness: 300, damping: 18, delay: delayNueva }
          : {}
      }
      className={`aspect-[3/5] rounded-lg cursor-pointer relative ${
        entrada ? 'shadow-md' : 'bg-secondary/20 border border-border/20'
      }`}
    >
      {entrada ? (
        <>
          {/* Borde animado */}
          <style>{`
            @keyframes rotar-borde {
              from { --angle: 0deg; }
              to { --angle: 360deg; }
            }
            .borde-animado-${entrada.carta.id.slice(0, 8)} {
              position: absolute;
              inset: 0;
              border-radius: 8px;
              padding: 2px;
              background: conic-gradient(from var(--angle, 0deg), ${RAREZA_CONIC[entrada.carta.rareza]});
              animation: rotar-borde 3s linear infinite;
              --angle: 0deg;
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: destination-out;
              mask-composite: exclude;
            }
          `}</style>
          <div className={`borde-animado-${entrada.carta.id.slice(0, 8)}`} />

          <div className="absolute inset-[2px] rounded-[6px] overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-b ${RAREZA_COLOR[entrada.carta.rareza]}`} />
            <img
              src={entrada.carta.imagenUrl}
              alt={entrada.carta.nombre}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-1">
              <p className="text-white text-[8px] font-bold truncate leading-tight">
                {entrada.carta.nombre}
              </p>
            </div>

            {/* Badge nueva */}
            {esNueva && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delayNueva + 0.3, type: 'spring', stiffness: 400 }}
                className="absolute top-1 left-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full"
              >
                NEW
              </motion.div>
            )}
          </div>

          {/* Efecto de destello al aparecer */}
          {esNueva && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: delayNueva }}
              className="absolute inset-0 rounded-lg bg-white pointer-events-none z-20"
            />
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <span className="text-xl opacity-20">?</span>
          <span className="text-[8px] text-muted-foreground opacity-50">#{posicion}</span>
        </div>
      )}
    </motion.div>
  )
}