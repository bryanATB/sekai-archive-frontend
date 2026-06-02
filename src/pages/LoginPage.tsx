import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import { useMejorasStore } from '../store/mejorasStore'

type Modo = 'login' | 'registro'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setMejoras = useMejorasStore((s) => s.setMejoras)

  const [modo, setModo] = useState<Modo>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const body =
        modo === 'registro'
          ? { email, username, password }
          : { email, password }

      const { data } = await api.post(`/auth/${modo}`, body)
      setAuth(data.access_token, data.usuarioId, data.esAdmin ?? false)
      localStorage.setItem('token', data.access_token)
      const mejoras = await api.get('/mejoras')
      setMejoras(mejoras.data)
      navigate('/clicker')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Ocurrió un error'
      setError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Sekai Archive
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Colecciona cartas de todos los universos
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-800 p-1 mb-6">
            {(['login', 'registro'] as Modo[]).map((m) => (
              <button
                key={m}
                onClick={() => { setModo(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  modo === m
                    ? 'bg-white text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {modo === 'registro' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="tu_username"
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {cargando
                ? 'Cargando...'
                : modo === 'login'
                  ? 'Entrar'
                  : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}