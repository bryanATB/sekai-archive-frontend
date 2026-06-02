import { NavLink, Outlet } from 'react-router-dom'
import { Sparkles, Package, BookOpen, BarChart2 } from 'lucide-react'

const LINKS = [
  { to: '/admin', label: 'Stats', icon: BarChart2, end: true },
  { to: '/admin/cartas', label: 'Cartas', icon: Sparkles },
  { to: '/admin/sobres', label: 'Sobres', icon: Package },
  { to: '/admin/albums', label: 'Álbumes', icon: BookOpen },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border/50 flex flex-col py-8 px-4 gap-2 shrink-0">
        <div className="px-3 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Admin
          </p>
          <h1 className="text-lg font-bold mt-1">Sekai Archive</h1>
        </div>

        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`
            }
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </NavLink>
        ))}

        <div className="mt-auto">
          <NavLink
            to="/clicker"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            ← Volver al juego
          </NavLink>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}