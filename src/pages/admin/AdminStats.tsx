import { useEffect, useState } from 'react'
import { Sparkles, Package, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../services/api'

interface Stats {
  totalCartas: number
  totalSobres: number
  totalUsuarios: number
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data))
  }, [])

  const items = [
    { label: 'Cartas', value: stats?.totalCartas, icon: Sparkles, color: 'text-purple-400' },
    { label: 'Sobres', value: stats?.totalSobres, icon: Package, color: 'text-blue-400' },
    { label: 'Usuarios', value: stats?.totalUsuarios, icon: Users, color: 'text-green-400' },
  ]

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
            <p className="text-4xl font-bold">{item.value ?? '—'}</p>
            <p className="text-muted-foreground text-sm mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}