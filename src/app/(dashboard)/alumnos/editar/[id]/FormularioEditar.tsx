"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateAlumno } from "@/app/actions/alumnos"

export default function FormularioEditar({ alumno }: { alumno: any }) {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMsg(null)
    setCargando(true)

    const formData = new FormData(event.currentTarget)
    const resultado = await updateAlumno(alumno.CODALUMNO, formData)

    if (resultado?.error) {
      setErrorMsg(resultado.error)
      setCargando(false)
    } else {
      // Redireccionamos de vuelta al listado principal de alumnos y refrescamos la información
      router.push("/alumnos")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3 rounded-lg font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido Paterno</label>
          <input
            name="apellidoPat"
            type="text"
            required
            defaultValue={alumno.APELLIDO_PAT}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido Materno</label>
          <input
            name="apellidoMat"
            type="text"
            required
            defaultValue={alumno.APELLIDO_MAT}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombres</label>
        <input
          name="nombres"
          type="text"
          required
          defaultValue={alumno.NOMBRES}
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
        <input
          name="email"
          type="email"
          defaultValue={alumno.EMAIL || ""}
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
          placeholder="ejemplo@correo.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Estado en el Sistema</label>
        <select
          name="estado"
          defaultValue={alumno.ESTADO || "A"}
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="A">✅ Activo</option>
          <option value="I">❌ Inactivo</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
        <button
          type="button"
          onClick={() => router.push("/alumnos")}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-400 shadow-md transition-colors"
        >
          {cargando ? "Guardando cambios..." : "Guardar Alumno"}
        </button>
      </div>
    </form>
  )
}
