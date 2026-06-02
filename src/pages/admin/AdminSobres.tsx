import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ToggleLeft, ToggleRight, Pencil, Trash2, Search, Upload } from 'lucide-react'
import api from '../../services/api'
import { subirImagen } from '../../services/cloudinary'

interface Carta {
  id: string
  nombre: string
  serie: string
  rareza: string
  imagenUrl: string
}

interface SobreCarta {
  cartaId: string
  peso: number
  carta: Carta
}

interface Sobre {
  id: string
  nombre: string
  descripcion: string | null
  costo: number
  cantCartas: number
  activo: boolean
  imagenUrl?: string | null
  sobreCartas: SobreCarta[]
}

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  costo: 100,
  cantCartas: 5,
  imagenUrl: '',
}

interface SelectorCartasProps {
  cartas: Carta[]
  cartasSeleccionadas: { cartaId: string; peso: number }[]
  busqueda: string
  setBusqueda: (v: string) => void
  onAgregar: (cartaId: string) => void
  onQuitar: (cartaId: string) => void
  onCambiarPeso: (cartaId: string, peso: number) => void
}

function SelectorCartas({
  cartas,
  cartasSeleccionadas,
  busqueda,
  setBusqueda,
  onAgregar,
  onQuitar,
  onCambiarPeso,
}: SelectorCartasProps) {
  const resultados = cartas
    .filter((c) => !cartasSeleccionadas.find((cs) => cs.cartaId === c.id))
    .filter((c) =>
      busqueda.length > 0
        ? c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.serie.toLowerCase().includes(busqueda.toLowerCase())
        : false,
    )

  return (
    <div>
      <label className="text-xs text-muted-foreground mb-2 block">
        Agregar cartas al sobre
      </label>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar carta por nombre o serie..."
          className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50"
        />
      </div>

      {busqueda.length > 0 && (
        <div className="bg-background border border-border rounded-xl overflow-hidden max-h-40 overflow-y-auto mb-2">
          {resultados.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">Sin resultados</p>
          ) : (
            resultados.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onAgregar(c.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
              >
                <img src={c.imagenUrl} className="w-7 h-7 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{c.nombre}</p>
                  <p className="text-xs text-muted-foreground">{c.rareza}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {cartasSeleccionadas.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {cartasSeleccionadas.map((cs) => {
            const carta = cartas.find((c) => c.id === cs.cartaId)
            if (!carta) return null
            return (
              <div
                key={cs.cartaId}
                className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2"
              >
                <img src={carta.imagenUrl} className="w-8 h-8 rounded object-cover" />
                <span className="flex-1 text-xs truncate">{carta.nombre}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Peso</span>
                  <input
                    type="number"
                    min={1}
                    value={cs.peso}
                    onChange={(e) => onCambiarPeso(cs.cartaId, Number(e.target.value))}
                    className="w-16 bg-secondary border border-border rounded-lg px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
                <button type="button" onClick={() => onQuitar(cs.cartaId)}>
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminSobres() {
  const [sobres, setSobres] = useState<Sobre[]>([])
  const [cartas, setCartas] = useState<Carta[]>([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState<{ cartaId: string; peso: number }[]>([])
  const [sobreDetalle, setSobreDetalle] = useState<Sobre | null>(null)
  const [editando, setEditando] = useState<Sobre | null>(null)
  const [formEditar, setFormEditar] = useState(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaEditar, setBusquedaEditar] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileEditarRef = useRef<HTMLInputElement>(null)
  const [subiendoEditar, setSubiendoEditar] = useState(false)
  const [previewEditar, setPreviewEditar] = useState<string | null>(null)

  async function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setPreview(URL.createObjectURL(archivo))
    setSubiendo(true)
    try {
      const url = await subirImagen(archivo)
      setForm((f) => ({ ...f, imagenUrl: url }))
    } catch { alert('Error al subir imagen') }
    finally { setSubiendo(false) }
  }

  useEffect(() => {
    cargarSobres()
    api.get('/admin/cartas').then((r) => setCartas(r.data))
  }, [])

  async function handleImagenEditar(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setPreviewEditar(URL.createObjectURL(archivo))
    setSubiendoEditar(true)
    try {
      const url = await subirImagen(archivo)
      setFormEditar((f) => ({ ...f, imagenUrl: url }))
    } catch { alert('Error al subir imagen') }
    finally { setSubiendoEditar(false) }
  }

  async function cargarSobres() {
    const { data } = await api.get('/admin/sobres')
    setSobres(data)
  }

  function getPesoDefault(cartaId: string): number {
  const carta = cartas.find((c) => c.id === cartaId)
  if (!carta) return 100
  const pesos: Record<string, number> = {
    COMUN: 400,
    RARA: 250,
    EPICA: 120,
    MITICA: 80,
    LEGENDARIA: 50,
    SECRETA: 16,
    EXCLUSIVA: 8,
    SEKAI: 2,
  }
  return pesos[carta.rareza] ?? 100
}

function agregarCarta(cartaId: string) {
  if (cartasSeleccionadas.find((c) => c.cartaId === cartaId)) return
  setCartasSeleccionadas((prev) => [...prev, { cartaId, peso: getPesoDefault(cartaId) }])
  setBusqueda('')
  setBusquedaEditar('')
}

  function quitarCarta(cartaId: string) {
    setCartasSeleccionadas((prev) => prev.filter((c) => c.cartaId !== cartaId))
  }

  function cambiarPeso(cartaId: string, peso: number) {
    setCartasSeleccionadas((prev) =>
      prev.map((c) => (c.cartaId === cartaId ? { ...c, peso } : c)),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cartasSeleccionadas.length === 0) {
      alert('Agrega al menos una carta al sobre')
      return
    }
    setGuardando(true)
    try {
      await api.post('/admin/sobres', { ...form, cartas: cartasSeleccionadas })
      setForm(FORM_INICIAL)
      setCartasSeleccionadas([])
      setBusqueda('')
      await cargarSobres()
    } finally {
      setGuardando(false) }
  }

  function abrirEditar(sobre: Sobre) {
    setEditando(sobre)
    setFormEditar({
      nombre: sobre.nombre,
      descripcion: sobre.descripcion ?? '',
      costo: sobre.costo,
      cantCartas: sobre.cantCartas,
      imagenUrl: sobre.imagenUrl ?? '',
    })
    setPreviewEditar(sobre.imagenUrl ?? null)
    setBusquedaEditar('')
    setCartasSeleccionadas(
    sobre.sobreCartas.map((sc) => ({ cartaId: sc.cartaId, peso: sc.peso })),
  )
}

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault()
    if (!editando) return
    setGuardando(true)
    try {
      await api.patch(`/admin/sobres/${editando.id}`, {
        ...formEditar,
        cartas: cartasSeleccionadas,
      })
      setEditando(null)
      setCartasSeleccionadas([])
      await cargarSobres()
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este sobre? Esta acción no se puede deshacer.')) return
    await api.delete(`/admin/sobres/${id}`)
    await cargarSobres()
  }

  async function handleToggleSobre(id: string) {
    const sobre = sobres.find((s) => s.id === id)
    if (!sobre) return
    await api.patch(`/admin/sobres/${id}`, { activo: !sobre.activo })
    await cargarSobres()
  }



  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Sobres</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario nuevo sobre */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo sobre
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imagen sobre */}
            <div
              onClick={() => fileRef.current?.click()}
              className="h-48 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              {preview ? (
                <img src={preview} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{subiendo ? 'Subiendo...' : 'Imagen del sobre'}</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagen} />

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Costo (puntos)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.costo}
                  onChange={(e) => setForm((p) => ({ ...p, costo: Number(e.target.value) }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cartas por sobre</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={form.cantCartas}
                  onChange={(e) => setForm((p) => ({ ...p, cantCartas: Number(e.target.value) }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <SelectorCartas
              cartas={cartas}
              cartasSeleccionadas={cartasSeleccionadas}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              onAgregar={(id) => agregarCarta(id)}
              onQuitar={quitarCarta}
              onCambiarPeso={cambiarPeso}
            />

            <button
              type="submit"
              disabled={guardando}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-50 hover:bg-primary/80 transition-colors text-sm"
            >
              {guardando ? 'Guardando...' : 'Crear sobre'}
            </button>
          </form>
        </div>

        {/* Lista de sobres */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {sobres.map((sobre, i) => (
            <motion.div
              key={sobre.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{sobre.nombre}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {sobre.costo} pts · {sobre.cantCartas} cartas · {sobre.sobreCartas.length} tipos
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSobreDetalle(sobre)}
                    className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-xs text-muted-foreground"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => abrirEditar(sobre)}
                    className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleEliminar(sobre.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive/70" />
                  </button>
                  <button onClick={() => handleToggleSobre(sobre.id)}>
                    {sobre.activo
                      ? <ToggleRight className="w-6 h-6 text-green-500" />
                      : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal detalle sobre */}
      <AnimatePresence>
        {sobreDetalle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSobreDetalle(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{sobreDetalle.nombre}</h3>
                <button onClick={() => setSobreDetalle(null)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {sobreDetalle.costo} pts · {sobreDetalle.cantCartas} cartas por apertura
              </p>
              <div className="space-y-2">
                {sobreDetalle.sobreCartas.map((sc) => {
                  const pesoTotal = sobreDetalle.sobreCartas.reduce((s, c) => s + c.peso, 0)
                  const prob = ((sc.peso / pesoTotal) * 100).toFixed(1)
                  return (
                    <div key={sc.cartaId} className="flex items-center gap-3 bg-background border border-border rounded-xl p-2.5">
                      <img src={sc.carta.imagenUrl} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sc.carta.nombre}</p>
                        <p className="text-xs text-muted-foreground">{sc.carta.rareza}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{prob}%</p>
                        <p className="text-xs text-muted-foreground">peso {sc.peso}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal editar sobre */}
      <AnimatePresence>
        {editando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setEditando(null); setCartasSeleccionadas([]) }}
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
                <h3 className="font-semibold">Editar sobre</h3>
                <button onClick={() => { setEditando(null); setCartasSeleccionadas([]) }}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Imagen sobre */}
              <div
                onClick={() => fileEditarRef.current?.click()}
                className="h-40 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden mb-4"
              >
                {previewEditar ? (
                  <img src={previewEditar} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{subiendoEditar ? 'Subiendo...' : 'Imagen del sobre'}</p>
                  </div>
                )}
              </div>
              <input ref={fileEditarRef} type="file" accept="image/*" className="hidden" onChange={handleImagenEditar} />

              <form onSubmit={handleEditar} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
                  <input
                    required
                    value={formEditar.nombre}
                    onChange={(e) => setFormEditar((p) => ({ ...p, nombre: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Costo</label>
                    <input
                      type="number"
                      min={1}
                      value={formEditar.costo}
                      onChange={(e) => setFormEditar((p) => ({ ...p, costo: Number(e.target.value) }))}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Cartas por sobre</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formEditar.cantCartas}
                      onChange={(e) => setFormEditar((p) => ({ ...p, cantCartas: Number(e.target.value) }))}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <SelectorCartas
                  cartas={cartas}
                  cartasSeleccionadas={cartasSeleccionadas}
                  busqueda={busquedaEditar}
                  setBusqueda={setBusquedaEditar}
                  onAgregar={(id) => agregarCarta(id)}
                  onQuitar={quitarCarta}
                  onCambiarPeso={cambiarPeso}
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditando(null); setCartasSeleccionadas([]) }}
                    className="flex-1 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
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