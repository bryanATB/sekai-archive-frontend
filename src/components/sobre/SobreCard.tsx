import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Pity {
  contadorExclusiva: number
  contadorSekai: number
}

interface Props {
  id: string
  nombre: string
  descripcion: string | null
  costo: number
  cantCartas: number
  imagenUrl: string | null
  puedeAbrir: boolean
  abriendo: boolean
  pity: Pity
  onAbrir: () => void
}

export default function SobreCard({
  nombre,
  descripcion,
  costo,
  cantCartas,
  imagenUrl,
  puedeAbrir,
  abriendo,
  pity,
  onAbrir,
}: Props) {
  const [cortando, setCortando] = useState(false)

  async function handleClick() {
    if (!puedeAbrir || abriendo || cortando) return
    setCortando(true)
    setTimeout(() => {
      setCortando(false)
      onAbrir()
    }, 700)
  }

  return (
    <div className="flex flex-col items-center gap-4 w-48">
      {/* Sobre */}
      <motion.div
        className="relative cursor-pointer select-none"
        style={{ width: '160px', height: '240px' }}
        whileHover={!cortando ? { y: -6 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={handleClick}
      >
        {/* Sombra dinámica */}
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/40 rounded-full blur-md"
          animate={{ scaleX: cortando ? 0.6 : 1, opacity: cortando ? 0.2 : 0.6 }}
        />

        {/* Cuerpo principal del sobre */}
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl">
          {/* Imagen de fondo — solo desde la mitad para abajo */}
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={nombre}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ clipPath: 'inset(52px 0 0 0)' }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/20" />
          )}

          {/* Interior del sobre — zona superior visible al abrir */}
          <div
            className="absolute left-0 right-0 top-0 z-10"
            style={{ height: '52px', background: 'linear-gradient(180deg, #0a0a0f 0%, #1a0a2e 60%, #2d1b4e 100%)' }}
          >
            
            {/* Brillo interior */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          </div>

          {/* Overlays decorativos */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/20 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-white/20 to-transparent" />
        </div>

        {/* Solapa superior */}
        <motion.div
          className="absolute left-0 right-0 top-0 z-10"
          style={{ height: '52px', transformOrigin: 'top center' }}
          whileHover={!cortando ? { rotateX: -25, y: -3 } : {}}
          animate={cortando ? { y: -80, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: cortando ? 0.5 : 0.25, ease: cortando ? 'easeIn' : 'easeOut' }}
        >
          {/* Solapa tiene su propia imagen — tapa el interior */}
          <div className="relative w-full h-full overflow-hidden rounded-t-xl">
            {imagenUrl && (
              <img
                src={imagenUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background: imagenUrl
                  ? 'rgba(0,0,0,0.3)'
                  : 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30" />
            <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />
          </div>
        </motion.div>

        {/* Línea de corte con destello */}
        <AnimatePresence>
          {cortando && (
            <motion.div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: '48px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Línea principal */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{
                  height: '2px',
                  transformOrigin: 'left center',
                  background: 'linear-gradient(90deg, transparent, #fff, #a78bfa, #fff, transparent)',
                  boxShadow: '0 0 12px rgba(167,139,250,0.9), 0 0 4px #fff',
                }}
              />
              {/* Partícula de destello */}
              <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: '160px', opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"
                style={{
                  left: 0,
                  boxShadow: '0 0 8px #a78bfa, 0 0 16px #fff',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay sin puntos */}
        {!puedeAbrir && (
          <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center z-30">
            <p className="text-white/60 text-xs font-medium">Sin puntos</p>
          </div>
        )}
      </motion.div>

      {/* Info del sobre */}
      <div className="w-full text-center space-y-2">
        <p className="text-foreground font-bold text-sm">{nombre}</p>
        {descripcion && (
          <p className="text-muted-foreground text-xs leading-tight">{descripcion}</p>
        )}
        <p className="text-muted-foreground text-xs">{cantCartas} cartas</p>

        {/* Pity */}
        <div className="space-y-1.5 pt-1">
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>Pity EXCLUSIVA</span>
              <span>{pity.contadorExclusiva} / 200</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(pity.contadorExclusiva / 200) * 100}%`,
                  background: pity.contadorExclusiva >= 100
                    ? 'linear-gradient(90deg, #a855f7, #ec4899)'
                    : '#6366f1',
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>Pity SEKAI</span>
              <span>{pity.contadorSekai} / 500</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(pity.contadorSekai / 500) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-primary font-bold">{costo.toLocaleString()} pts</p>

        <button
          onClick={handleClick}
          disabled={!puedeAbrir || abriendo || cortando}
          className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-40 hover:bg-primary/80 transition-colors text-sm"
        >
          {abriendo || cortando ? 'Abriendo...' : 'Abrir sobre'}
        </button>
      </div>
    </div>
  )
}