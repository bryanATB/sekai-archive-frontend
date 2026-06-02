import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CartaData } from './CartaComponent'

const RAREZA_CONFIG: Record<string, {
  color: string
  estrellas: number
  gradiente: string
  textoColor: string
}> = {
  COMUN:      { color: '#9ca3af', estrellas: 1, gradiente: 'from-gray-600 to-gray-800',         textoColor: 'text-gray-400' },
  RARA:       { color: '#60a5fa', estrellas: 2, gradiente: 'from-blue-600 to-blue-900',          textoColor: 'text-blue-400' },
  EPICA:      { color: '#c084fc', estrellas: 3, gradiente: 'from-purple-600 to-purple-900',      textoColor: 'text-purple-400' },
  MITICA:     { color: '#dc2626', estrellas: 4, gradiente: 'from-zinc-800 to-red-900',           textoColor: 'text-red-400' },
  LEGENDARIA: { color: '#fbbf24', estrellas: 5, gradiente: 'from-yellow-500 to-orange-700',      textoColor: 'text-yellow-400' },
  SECRETA:    { color: '#fb7185', estrellas: 6, gradiente: 'from-rose-500 to-red-800',           textoColor: 'text-rose-400' },
  EXCLUSIVA:  { color: '#67e8f9', estrellas: 7, gradiente: 'from-cyan-400 to-indigo-700',        textoColor: 'text-cyan-400' },
  SEKAI:      { color: '#fcd34d', estrellas: 8, gradiente: 'from-amber-300 via-pink-500 to-violet-600', textoColor: 'text-amber-300' },
}

interface Props {
  carta: CartaData
  pegadaEn?: string
  posicion?: number
  onCerrar: () => void
}

export default function CartaInspeccion({ carta, pegadaEn, posicion, onCerrar }: Props) {
  const [volteada, setVolteada] = useState(false)
  const config = RAREZA_CONFIG[carta.rareza]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col sm:flex-row items-center gap-30 max-w-2xl w-full"
      >
        {/* Carta 3D */}
        <div
          className="shrink-0 cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => setVolteada((v) => !v)}
        >
          <motion.div
            animate={{ rotateY: volteada ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              transformStyle: 'preserve-3d',
              width: '260px',
              height: '420px',
              willChange: 'transform',
            }}
            className="relative"
          >
            {/* Frente */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Borde gradiente */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(90deg, ${config.color}, #ffffff80, ${config.color})`,
                  backgroundSize: '200% 100%',
                  animation: 'arcoiris 4s ease-in-out infinite',
                }}
              />
              <div className="absolute inset-[2px] rounded-2xl overflow-hidden">
                <img
                  src={carta.imagenUrl}
                  alt={carta.nombre}
                  className="w-full h-full object-cover"
                />
                {/* Gradiente inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Nombre en la carta */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-bold truncate">{carta.nombre}</p>
                </div>
              </div>
            </div>

            {/* Reverso */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(90deg, ${config.color}, #ffffff80, ${config.color})`,
                  backgroundSize: '200% 100%',
                  animation: 'arcoiris 4s ease-in-out infinite',
                }}
              />
              <div className="absolute inset-[2px] rounded-2xl overflow-hidden">
                {carta.imagenReversoUrl ? (
                  <img
                    src={carta.imagenReversoUrl}
                    alt="Reverso"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl mb-2">✦</p>
                      <p className="text-muted-foreground text-xs">Sin reverso</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Hint voltear */}
          <p className="text-center text-muted-foreground text-xs mt-3">
            {volteada ? 'Click para ver el frente' : 'Click para voltear'}
          </p>
        </div>

        {/* Info panel */}
        <div className="flex-1 min-w-0">
          {/* Nombre */}
          <h2 className="text-2xl font-bold text-white mb-1">{carta.nombre}</h2>
          <p className="text-muted-foreground text-sm mb-4">{carta.serie}</p>

          {/* Rareza */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Rareza</p>
            <p
              className="font-bold text-lg"
              style={{
                background: `linear-gradient(90deg, ${config.color}, #ffffff80, ${config.color})`,
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'arcoiris 4s ease-in-out infinite',
              }}
            >
              {carta.rareza}
            </p>
            {/* Estrellas */}
            <div className="flex gap-1 mt-1">
              {Array.from({ length: config.estrellas }).map((_, i) => (
                <span key={i} className="text-lg" style={{ color: config.color }}>★</span>
              ))}
            </div>
          </div>

          {/* Personaje */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Personaje</p>
            <p className="text-white text-sm font-medium">{carta.personaje}</p>
          </div>

          {/* Descripción */}
          {carta.descripcion && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Descripción</p>
              <p className="text-foreground/80 text-sm italic">"{carta.descripcion}"</p>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {carta.limitada && (
              <span className="px-2 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-medium rounded-lg">
                ✦ Limitada
              </span>
            )}
            {carta.fueNueva && (
              <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium rounded-lg">
                ✦ Nueva
              </span>
            )}
          </div>

          {/* Fecha y posición */}
          {(pegadaEn || posicion) && (
            <div className="pt-4 border-t border-border/50 space-y-1">
              {posicion && (
                <p className="text-xs text-muted-foreground">
                  Posición <span className="text-foreground">#{posicion}</span> en el álbum
                </p>
              )}
              {pegadaEn && (
                <p className="text-xs text-muted-foreground">
                  Obtenida el{' '}
                  <span className="text-foreground">
                    {new Date(pegadaEn).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
              )}
            </div>
          )}

          <button
            onClick={onCerrar}
            className="mt-6 w-full py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}