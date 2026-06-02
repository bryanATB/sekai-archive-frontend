import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, BookOpen, Upload } from 'lucide-react'
import { subirImagen } from '../../services/cloudinary'
import api from '../../services/api'

interface Album {
  id: string
  nombre: string
  descripcion: string | null
  totalCartas: number
  imagenUrl: string | null
  creadoEn: string
  _count: { entradas: number }
}

interface FormAlbumProps {
  values: { nombre: string; descripcion: string; totalCartas: number; imagenUrl: string }
  onChange: (v: { nombre: string; descripcion: string; totalCartas: number; imagenUrl: string }) => void
  onSubmit: (e: React.FormEvent) => void
  guardando: boolean
  labelBoton: string
}

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  totalCartas: 10,
  imagenUrl: '',
}

function FormAlbum({ values, onChange, onSubmit, guardando, labelBoton }: FormAlbumProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState<string | null>(values.imagenUrl || null)

  async function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setPreview(URL.createObjectURL(archivo))
    setSubiendo(true)
    try {
      const url = await subirImagen(archivo)
      onChange({ ...values, imagenUrl: url })
    } catch {
      alert('Error al subir imagen')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Imagen de portada</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="h-40 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
        >
          {preview ? (
            <img src={preview} className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-muted-foreground">
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{subiendo ? 'Subiendo...' : 'Click para subir portada'}</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagen} />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
        <input
          required
          value={values.nombre}
          onChange={(e) => onChange({ ...values, nombre: e.target.value })}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
          placeholder="Álbum de Waifus"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Descripción</label>
        <textarea
          value={values.descripcion}
          onChange={(e) => onChange({ ...values, descripcion: e.target.value })}
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
          placeholder="Descripción del álbum..."
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Total de cartas</label>
        <input
          type="number"
          min={1}
          required
          value={values.totalCartas}
          onChange={(e) => onChange({ ...values, totalCartas: Number(e.target.value) })}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Cuántas cartas distintas tiene este álbum en total
        </p>
      </div>

      <button
        type="submit"
        disabled={guardando || subiendo}
        className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-50 hover:bg-primary/80 transition-colors text-sm"
      >
        {guardando ? 'Guardando...' : labelBoton}
      </button>
    </form>
  )
}

export default function AdminAlbums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [editando, setEditando] = useState<Album | null>(null)
  const [formEditar, setFormEditar] = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargarAlbums() }, [])

  async function cargarAlbums() {
    const { data } = await api.get('/admin/albums')
    setAlbums(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post('/admin/albums', form)
      setForm(FORM_INICIAL)
      await cargarAlbums()
    } finally {
      setGuardando(false)
    }
  }

  function abrirEditar(album: Album) {
    setEditando(album)
    setFormEditar({
      nombre: album.nombre,
      descripcion: album.descripcion ?? '',
      totalCartas: album.totalCartas,
      imagenUrl: album.imagenUrl ?? '',
    })
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault()
    if (!editando) return
    setGuardando(true)
    try {
      await api.patch(`/admin/albums/${editando.id}`, formEditar)
      setEditando(null)
      await cargarAlbums()
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este álbum? Se eliminarán todas las entradas asociadas.')) return
    await api.delete(`/admin/albums/${id}`)
    await cargarAlbums()
  }


  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Álbumes</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo álbum
          </h3>
          <FormAlbum
            values={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            guardando={guardando}
            labelBoton="Crear álbum"
          />
        </div>

        {/* Lista */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{album.nombre}</p>
                  {album.descripcion && (
                    <p className="text-muted-foreground text-xs mt-0.5 truncate">
                      {album.descripcion}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {album._count.entradas} / {album.totalCartas} cartas colocadas
                    </span>
                    <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min((album._count.entradas / album.totalCartas) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => abrirEditar(album)}
                    className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleEliminar(album.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive/70" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {albums.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <BookOpen className="w-8 h-8 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No hay álbumes creados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal editar */}
      <AnimatePresence>
        {editando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditando(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Editar álbum</h3>
                <button onClick={() => setEditando(null)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <FormAlbum
                values={formEditar}
                onChange={setFormEditar}
                onSubmit={handleEditar}
                guardando={guardando}
                labelBoton="Guardar cambios"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}