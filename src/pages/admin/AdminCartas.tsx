import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ToggleLeft, ToggleRight, Upload, Pencil, Trash2, X } from 'lucide-react'
import api from '../../services/api'
import { subirImagen } from '../../services/cloudinary'

type Rareza = 'COMUN' | 'RARA' | 'EPICA' | 'MITICA' | 'LEGENDARIA' | 'SECRETA' | 'EXCLUSIVA' | 'SEKAI'

interface Carta {
  id: string
  nombre: string
  personaje: string
  serie: string
  rareza: Rareza
  imagenUrl: string
  imagenReversoUrl: string | null
  descripcion: string | null
  limitada: boolean
  activa: boolean
  albumId: string | null
  album: { id: string; nombre: string } | null
}

const RAREZAS: Rareza[] = ['COMUN', 'RARA', 'EPICA', 'MITICA', 'LEGENDARIA', 'SECRETA', 'EXCLUSIVA', 'SEKAI']

const FORM_INICIAL = {
  nombre: '',
  personaje: '',
  serie: '',
  rareza: 'COMUN' as Rareza,
  imagenUrl: '',
  imagenReversoUrl: '',
  descripcion: '',
  limitada: false,
  albumId: '',
}

export default function AdminCartas() {
  const [cartas, setCartas] = useState<Carta[]>([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [editando, setEditando] = useState<Carta | null>(null)
  const [formEditar, setFormEditar] = useState(FORM_INICIAL)
  const [subiendo, setSubiendo] = useState(false)
  const [subiendoEditar, setSubiendoEditar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [previewEditar, setPreviewEditar] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const fileEditarRef = useRef<HTMLInputElement>(null)
  const fileReversoRef = useRef<HTMLInputElement>(null)
  const [subiendoReverso, setSubiendoReverso] = useState(false)
  const [previewReverso, setPreviewReverso] = useState<string | null>(null)
  const fileReversoEditarRef = useRef<HTMLInputElement>(null)
  const [subiendoReversoEditar, setSubiendoReversoEditar] = useState(false)
  const [previewReversoEditar, setPreviewReversoEditar] = useState<string | null>(null)
  const [albums, setAlbums] = useState<{ id: string; nombre: string }[]>([])

  useEffect(() => {
    cargarCartas()
    api.get('/admin/albums').then((r) => setAlbums(r.data))
  }, [])

  async function cargarCartas() {
    const { data } = await api.get('/admin/cartas')
    setCartas(data)
  }

  async function handleImagen(e: React.ChangeEvent<HTMLInputElement>, esEditar = false) {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    const objectUrl = URL.createObjectURL(archivo)
    if (esEditar) {
      setPreviewEditar(objectUrl)
      setSubiendoEditar(true)
      try {
        const url = await subirImagen(archivo)
        setFormEditar((f) => ({ ...f, imagenUrl: url }))
      } catch { alert('Error al subir imagen') }
      finally { setSubiendoEditar(false) }
    } else {
      setPreview(objectUrl)
      setSubiendo(true)
      try {
        const url = await subirImagen(archivo)
        setForm((f) => ({ ...f, imagenUrl: url }))
      } catch { alert('Error al subir imagen') }
      finally { setSubiendo(false) }
    }
  }

  async function handleImagenReverso(e: React.ChangeEvent<HTMLInputElement>, esEditar = false) {
  const archivo = e.target.files?.[0]
  if (!archivo) return

  const objectUrl = URL.createObjectURL(archivo)
  if (esEditar) {
    setPreviewReversoEditar(objectUrl)
    setSubiendoReversoEditar(true)
    try {
      const url = await subirImagen(archivo)
      setFormEditar((f) => ({ ...f, imagenReversoUrl: url }))
    } catch { alert('Error al subir imagen') }
    finally { setSubiendoReversoEditar(false) }
  } else {
    setPreviewReverso(objectUrl)
    setSubiendoReverso(true)
    try {
      const url = await subirImagen(archivo)
      setForm((f) => ({ ...f, imagenReversoUrl: url }))
    } catch { alert('Error al subir imagen') }
    finally { setSubiendoReverso(false) }
  }
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.imagenUrl) { alert('Sube una imagen primero'); return }
    setGuardando(true)
    try {
      await api.post('/admin/cartas', form)
      setForm(FORM_INICIAL)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      await cargarCartas()
    } finally { setGuardando(false) }
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault()
    if (!editando) return
    setGuardando(true)
    try {
      await api.patch(`/admin/cartas/${editando.id}`, formEditar)
      setEditando(null)
      await cargarCartas()
    } finally { setGuardando(false) }
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar esta carta? Esta acción no se puede deshacer.')) return
    await api.delete(`/admin/cartas/${id}`)
    await cargarCartas()
  }

  async function handleToggle(id: string) {
    await api.patch(`/admin/cartas/${id}/toggle`)
    await cargarCartas()
  }

  function abrirEditar(carta: Carta) {
    setEditando(carta)
    setFormEditar({
      nombre: carta.nombre,
      personaje: carta.personaje,
      serie: carta.serie,
      rareza: carta.rareza,
      imagenUrl: carta.imagenUrl,
      imagenReversoUrl: carta.imagenReversoUrl ?? '',
      descripcion: carta.descripcion ?? '',
      limitada: carta.limitada,
      albumId: carta.albumId ?? '',
    })
    setPreview(carta.imagenUrl)
    setPreviewReverso(carta.imagenReversoUrl ?? null)
    setPreviewEditar(carta.imagenUrl)
    setPreviewReversoEditar(carta.imagenReversoUrl ?? null)
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Cartas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario nueva carta */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva carta
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="h-40 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              {preview ? (
                <img src={preview} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{subiendo ? 'Subiendo...' : 'Click para subir imagen'}</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagen(e)} />

            {/* Imagen reverso */}
            <div
              onClick={() => fileReversoRef.current?.click()}
              className="h-40 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              {previewReverso ? (
                <img src={previewReverso} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{subiendoReverso ? 'Subiendo...' : 'Imagen del reverso (opcional)'}</p>
                </div>
              )}
            </div>
            <input ref={fileReversoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagenReverso(e)} />



            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'nombre', label: 'Nombre', full: true },
                { key: 'personaje', label: 'Personaje', full: false },
                { key: 'serie', label: 'Serie', full: false },
              ].map((f) => (
                <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                  <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                  <input
                    required
                    value={form[f.key as keyof typeof form] as string}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Rareza</label>
              <select
                value={form.rareza}
                onChange={(e) => setForm((p) => ({ ...p, rareza: e.target.value as Rareza }))}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              >
                {RAREZAS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Álbum</label>
              <select
                value={form.albumId}
                onChange={(e) => setForm((p) => ({ ...p, albumId: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="">Sin álbum</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.limitada}
                onChange={(e) => setForm((p) => ({ ...p, limitada: e.target.checked }))}
              />
              <span className="text-sm">Carta limitada</span>
            </label>

            <button
              type="submit"
              disabled={guardando || subiendo}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-50 hover:bg-primary/80 transition-colors text-sm"
            >
              {guardando ? 'Guardando...' : 'Crear carta'}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {cartas.map((carta, i) => (
            <motion.div
              key={carta.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
            >
              <img
                src={carta.imagenUrl}
                alt={carta.nombre}
                className="w-12 h-12 rounded-lg object-cover bg-secondary shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{carta.nombre}</p>
                <p className="text-muted-foreground text-xs">
                  {carta.serie} · {carta.rareza}
                  {carta.album && ` · ${carta.album.nombre}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => abrirEditar(carta)}
                  className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleEliminar(carta.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive/70" />
                </button>
                <button onClick={() => handleToggle(carta.id)}>
                  {carta.activa
                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                    : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  }
                </button>
              </div>
            </motion.div>
          ))}
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
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Editar carta</h3>
                <button onClick={() => setEditando(null)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleEditar} className="space-y-4">
                <div
                  onClick={() => fileEditarRef.current?.click()}
                  className="h-36 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                >
                  {previewEditar ? (
                    <img src={previewEditar} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">{subiendoEditar ? 'Subiendo...' : 'Cambiar imagen'}</p>
                    </div>
                  )}
                </div>
                <input ref={fileEditarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagen(e, true)} />

                {/* Imagen reverso editar */}
                <div
                  onClick={() => fileReversoEditarRef.current?.click()}
                  className="h-36 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                >
                  {previewReversoEditar ? (
                    <img src={previewReversoEditar} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">{subiendoReversoEditar ? 'Subiendo...' : 'Cambiar reverso (opcional)'}</p>
                    </div>
                  )}
                </div>
                <input ref={fileReversoEditarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagenReverso(e, true)} />

                {[
                  { key: 'nombre', label: 'Nombre' },
                  { key: 'personaje', label: 'Personaje' },
                  { key: 'serie', label: 'Serie' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                    <input
                      required
                      value={formEditar[f.key as keyof typeof formEditar] as string}
                      onChange={(e) => setFormEditar((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Rareza</label>
                  <select
                    value={formEditar.rareza}
                    onChange={(e) => setFormEditar((p) => ({ ...p, rareza: e.target.value as Rareza }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    {RAREZAS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Álbum</label>
                  <select
                    value={formEditar.albumId}
                    onChange={(e) => setFormEditar((p) => ({ ...p, albumId: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Sin álbum</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Descripción</label>
                  <textarea
                    value={formEditar.descripcion}
                    onChange={(e) => setFormEditar((p) => ({ ...p, descripcion: e.target.value }))}
                    rows={2}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formEditar.limitada}
                    onChange={(e) => setFormEditar((p) => ({ ...p, limitada: e.target.checked }))}
                  />
                  <span className="text-sm">Carta limitada</span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditando(null)}
                    className="flex-1 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando || subiendoEditar}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-50 hover:bg-primary/80 transition-colors text-sm"
                  >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}