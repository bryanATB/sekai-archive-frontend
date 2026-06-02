import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Store, BookOpen, Package } from 'lucide-react'

const TABS = [
  { id: 'clicker', label: 'Clicker', icon: Sparkles, ruta: '/clicker' },
  { id: 'tienda', label: 'Tienda', icon: Store, ruta: '/tienda' },
  { id: 'album', label: 'Álbum', icon: BookOpen, ruta: '/album' },
  { id: 'inventario', label: 'Inventario', icon: Package, ruta: '/inventario' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="border-t border-border/50 backdrop-blur-sm bg-background/30 px-4 py-3">
      <div className="flex justify-around max-w-md mx-auto">
        {TABS.map((tab) => {
          const activo = location.pathname === tab.ruta
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.ruta)}
              className={`relative flex flex-col items-center gap-1.5 px-6 py-2 rounded-xl transition-all duration-200 ${
                activo
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
              {activo && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}