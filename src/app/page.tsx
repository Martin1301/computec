"use client" // Habilita el uso de estados interactivos en el navegador

import { useState } from "react"
import { loginSistema } from "./actions/auth"

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const formData = new FormData(event.currentTarget)
    const resultado = await loginSistema(formData)

    if (resultado?.error) {
      setErrorMsg(resultado.error)
      setCargando(false)
    } else if (resultado?.success) {
      // Si el login es correcto, el navegador nos lleva a la vista de alumnos que creamos antes
      window.location.href = "/alumnos"
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">COMPUTEC</h2>
          <p className="mt-2 text-sm text-gray-600">Inicia sesión para acceder al sistema</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800 border border-red-200">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Usuario</label>
              <input
                name="usuario"
                type="text"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Nombre de usuario"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 transition-all"
          >
            {cargando ? "Validando credenciales..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
    </div>
  )
}
