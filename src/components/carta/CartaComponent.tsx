import { motion } from 'framer-motion'

export type Rareza =
  | 'COMUN'
  | 'RARA'
  | 'EPICA'
  | 'MITICA'
  | 'LEGENDARIA'
  | 'SECRETA'
  | 'EXCLUSIVA'
  | 'SEKAI'

export interface CartaData {
  id: string
  nombre: string
  personaje: string
  serie: string
  rareza: Rareza
  imagenUrl: string
  imagenReversoUrl?: string | null
  descripcion?: string
  limitada: boolean
  fueNueva?: boolean
}

const RAREZA_CONFIG: Record<Rareza, { label: string; clase: string; brillo: string }> = {
  COMUN:      { label: '★ Común',      clase: 'from-gray-600 to-gray-800',         brillo: 'shadow-gray-500/30' },
  RARA:       { label: '★★ Rara',      clase: 'from-blue-600 to-blue-900',          brillo: 'shadow-blue-500/40' },
  EPICA:      { label: '★★★ Épica',    clase: 'from-purple-600 to-purple-900',      brillo: 'shadow-purple-500/50' },
  MITICA:     { label: '★★★★ Mítica',  clase: 'from-zinc-800 to-red-900',           brillo: 'shadow-red-700/60' },
  LEGENDARIA: { label: '★★★★★ Leg.',   clase: 'from-yellow-500 to-orange-700',      brillo: 'shadow-yellow-500/60' },
  SECRETA:    { label: '✦★★★★★ Secreta',    clase: 'from-rose-500 to-red-800',           brillo: 'shadow-rose-500/60' },
  EXCLUSIVA:  { label: '✦✦★★★★★ Exclusiva', clase: 'from-cyan-400 to-indigo-700',        brillo: 'shadow-cyan-400/70' },
  SEKAI:      { label: '✦✦✦★★★★★ SEKAI',      clase: 'from-amber-300 via-pink-500 to-violet-600', brillo: 'shadow-amber-400/80' },
}

interface Props {
  carta: CartaData
  delay?: number
  onClick?: () => void
}

export default function CartaComponent({ carta, delay = 0, onClick }: Props) {
  const config = RAREZA_CONFIG[carta.rareza]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring', stiffness: 200 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl bg-gradient-to-b ${config.clase} shadow-xl ${config.brillo} w-36 overflow-hidden select-none`}
    >
      {/* Badge nueva */}
      {carta.fueNueva && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          NUEVA
        </div>
      )}

      {/* Badge limitada */}
      {carta.limitada && (
        <div className="absolute top-2 right-2 z-10 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
          LTD
        </div>
      )}

      {/* Imagen */}
      <div className="w-full h-44 bg-black/30 flex items-center justify-center overflow-hidden">
        <img
          src={carta.imagenUrl}
          alt={carta.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = ''
            e.currentTarget.style.display = 'none'
          }}
        />
        {/* Placeholder si no carga la imagen */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
          ✦
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white font-bold text-sm truncate">{carta.nombre}</p>
        <p className="text-white/60 text-xs truncate">{carta.serie}</p>
        <p className="text-white/80 text-xs mt-1 font-medium">{config.label}</p>
      </div>

      {/* Brillo overlay para rarezas altas */}
      {['LEGENDARIA', 'SECRETA', 'EXCLUSIVA', 'SEKAI'].includes(carta.rareza) && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
      )}
    </motion.div>
  )
}