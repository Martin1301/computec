"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createAlumno } from "@/app/actions/alumnos"

export default function NuevoAlumnoPage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const formData = new FormData(event.currentTarget)
    const resultado = await createAlumno(formData)

    if (resultado?.error) {
      setErrorMsg(resultado.error)
      setCargando(false)
    } else {
      router.push("/alumnos")
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registrar Nuevo Estudiante</h1>
          <p className="text-sm text-slate-500">Asegúrese de ingresar todos los campos requeridos por el sistema</p>
        </div>
        <Link
          href="/alumnos"
          className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          Anular / Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3 rounded-lg font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Bloque 1: Códigos de Control Nativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-50 pb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Código de Alumno
            </label>
            <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-sm font-semibold text-blue-800">
              Se genera automáticamente al registrar
            </div>
            <p className="mt-1 text-xs text-slate-500">
              El sistema asignará el siguiente código disponible.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Código Local <span className="text-rose-500">*</span></label>
            <input name="codLocal" type="text" required defaultValue="00" maxLength={2}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Código Asistencia <span className="text-rose-500">*</span></label>
            <input name="codigoAsist" type="text" required placeholder="Ej: ROJASTAM" maxLength={20}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        {/* Bloque 2: Datos Personales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido Paterno <span className="text-rose-500">*</span></label>
            <input name="apellidoPat" type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido Materno <span className="text-rose-500">*</span></label>
            <input name="apellidoMat" type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombres <span className="text-rose-500">*</span></label>
            <input name="nombres" type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Nacimiento <span className="text-rose-500">*</span></label>
            <input name="fechaNac" type="date" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Sexo <span className="text-rose-500">*</span></label>
            <select name="sexo" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none">
              <option value="M">Masculino (M)</option>
              <option value="F">Femenino (F)</option>
            </select>
          </div>
        </div>

        {/* Bloque 3: Datos de Contacto Opcionales */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Domicilio</label>
          <input name="domicilio" type="text" placeholder="Dirección actual de residencia" maxLength={100}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
            <input name="telefono" type="text" placeholder="Ej: 955094362" maxLength={30}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input name="email" type="email" placeholder="ejemplo@correo.com" maxLength={50}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
          <button
            type="submit"
            disabled={cargando}
            className="w-full md:w-auto px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:bg-slate-400 shadow-lg transition-colors"
          >
            {cargando ? "Registrando en SQL Server..." : "Matricular Alumno"}
          </button>
        </div>
      </form>
    </div>
  )
}
