import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import api from '../services/api'

interface AlbumResumen {
  id: string
  nombre: string
  descripcion: string | null
  totalCartas: number
  imagenUrl: string | null
  progreso: number
}

export default function AlbumPage() {
  const [albums, setAlbums] = useState<AlbumResumen[]>([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/sobres/albums').then((r) => {
      setAlbums(r.data)
      setCargando(false)
    })
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando álbumes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 py-5 border-b border-border/50">
        <h1 className="text-xl font-bold">Álbumes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {albums.length} álbum{albums.length !== 1 ? 'es' : ''} disponibles
        </p>
      </header>

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <span className="text-6xl opacity-20">📚</span>
            <p className="text-muted-foreground text-center">No hay álbumes disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {albums.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/album/${album.id}`)}
                className="cursor-pointer group"
              >
                {/* Libro */}
                <div className="relative">
                  {/* Sombra del lomo */}
                  <div className="absolute left-0 top-1 bottom-1 w-4 bg-black/40 rounded-l-sm" />

                  {/* Portada */}
                  <motion.div
                    whileHover={{ rotateY: -15, x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ transformPerspective: 800, transformOrigin: 'left center' }}
                    className="relative ml-3 rounded-r-lg overflow-hidden shadow-xl aspect-[3/4]"
                  >
                    {album.imagenUrl ? (
                      <img
                        src={album.imagenUrl}
                        alt={album.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl opacity-40">📖</span>
                      </div>
                    )}

                    {/* Overlay con info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-bold truncate">{album.nombre}</p>
                    </div>

                    {/* Lomo visible */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/30" />
                  </motion.div>
                </div>

                {/* Progreso */}
                <div className="mt-3 px-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{album.progreso} / {album.totalCartas}</span>
                    <span>{Math.round((album.progreso / album.totalCartas) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((album.progreso / album.totalCartas) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  )
}