import { Suspense } from "react"
import Link from "next/link"
import { getDetalleCursosMatriculados } from "@/app/actions/matriculas"

export const instant = false

async function TablaDetalleCursos() {
  const detalles = await getDetalleCursosMatriculados()

  return (
    <div className="w-full min-w-0 overflow-x-auto">
    <table className="w-full min-w-[850px] table-auto divide-y divide-slate-200">
      <thead className="bg-slate-900 text-white">
        <tr>
          <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider">Código Curso</th>
          <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider">Código Docente</th>
          <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Fecha Inicio</th>
          <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Fecha Fin</th>
          <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {detalles.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">
              No se registran asignaciones detalladas en la base de datos actual.
            </td>
          </tr>
        ) : (
          detalles.map((det) => (
            <tr key={`${det.ID_CURSO}-${det.COD_DOCENTE}`} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-2 py-2 whitespace-normal break-words text-sm font-mono font-bold text-slate-700">
                {det.ID_CURSO}
              </td>
              <td className="px-2 py-2 whitespace-normal break-words text-sm font-medium text-blue-600">
                {det.COD_DOCENTE}
              </td>
              <td className="px-2 py-2 whitespace-normal break-words text-sm text-center text-slate-600">
                {new Date(det.F_DESDE).toLocaleDateString("es-PE")}
              </td>
              <td className="px-2 py-2 whitespace-normal break-words text-sm text-center text-slate-600">
                {new Date(det.F_HASTA).toLocaleDateString("es-PE")}
              </td>
              <td className="px-2 py-2 whitespace-normal break-words text-center">
                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  det.COD_ESTADO === "A" || det.COD_ESTADO === "1"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {det.COD_ESTADO === "A" || det.COD_ESTADO === "1" ? "Vigente" : "Concluido"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    </div>
  )
}

export default function DetalleMatriculasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Carga Horaria y Detalle de Asignaciones</h1>
          <p className="text-sm text-slate-500">Cruce oficial de cursos y docentes matriculados en SQL Server</p>
        </div>
        <Link
          href="/matriculas"
          className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          ⬅️ Ver Cabeceras
        </Link>
      </div>
      
      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium animate-pulse">Sincronizando con Docker...</div>}>
          <TablaDetalleCursos />
        </Suspense>
      </div>
    </div>
  )
}
