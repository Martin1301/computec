import { Suspense } from "react"
import { getMatriculasGlobales } from "@/app/actions/matriculas"

export const instant = false

async function TablaMatriculas() {
  const matriculas = await getMatriculasGlobales()

  return (
    <div className="w-full min-w-0 overflow-x-auto">
    <table className="w-full min-w-[650px] table-auto divide-y divide-slate-200">
      <thead className="bg-slate-50 text-slate-700">
        <tr>
          <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider">Código Matrícula</th>
          <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider">Código del Alumno</th>
          <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Estado de Ficha</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {matriculas.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400 italic">
              No se registran fichas de matrícula en la base de datos actual.
            </td>
          </tr>
        ) : (
          matriculas.map((mat) => (
            <tr key={mat.COD_MATRICULA} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-2 py-2 whitespace-normal break-words text-sm font-mono font-bold text-slate-700">
                {mat.COD_MATRICULA}
              </td>
              <td className="px-2 py-2 whitespace-normal break-words text-sm font-medium text-blue-600">
                {mat.CODALUMNO}
              </td>
              <td className="px-2 py-2 whitespace-normal break-words text-center">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  mat.ESTADO === "A" || mat.ESTADO === "1"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {mat.ESTADO === "A" || mat.ESTADO === "1" ? "Vigente" : "Inactivo"}
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

export default function MatriculasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Matrículas</h1>
          <p className="text-sm text-slate-500">Listado oficial de admisiones indexadas en SQL Server</p>
        </div>
      </div>
      
      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium animate-pulse">Consultando Registros Academicos...</div>}>
          <TablaMatriculas />
        </Suspense>
      </div>
    </div>
  )
}
