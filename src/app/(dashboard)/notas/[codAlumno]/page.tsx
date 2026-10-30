import Link from "next/link"
import { getNotasByAlumno } from "@/app/actions/notas"
import { getAlumnoByCodigo } from "@/app/actions/alumnos"

interface Props {
  params: Promise<{ codAlumno: string }>
}

export default async function NotasAlumnoPage({ params }: Props) {
  const { codAlumno } = await params
  const alumno = await getAlumnoByCodigo(codAlumno)
  const notas = await getNotasByAlumno(codAlumno)

  if (!alumno) {
    return <div className="p-4 text-rose-600 font-bold">Estudiante no localizado en la base de datos.</div>
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Maestro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro Oficial de Calificaciones</h1>
          <p className="text-sm text-slate-500">
            Alumno: <span className="font-semibold text-blue-900">{alumno.APELLIDO_PAT} {alumno.APELLIDO_MAT}, {alumno.NOMBRES}</span>
          </p>
        </div>
        <Link
          href="/alumnos"
          className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl transition-colors"
        >
          ⬅️ Volver al Listado
        </Link>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="w-full min-w-0 overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[1100px] table-auto divide-y divide-slate-200">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="min-w-[180px] whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID Nota / Operación</th>
              <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">A1</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">A2</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">A3</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">CE1</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Logro</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider">Nota Final</th>
              <th className="min-w-[260px] whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {notas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400 italic">
                  El estudiante no registra calificaciones asignadas en esta tabla actualmente.
                </td>
              </tr>
            ) : (
              notas.map((nota) => (
                <tr key={nota.IDNOTA} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-2 py-2 whitespace-normal break-words text-sm text-slate-700 font-medium">
                    <div className="font-bold text-slate-900">{nota.IDNOTA}</div>
                    <div className="text-xs text-slate-400 font-mono">Op: {nota.IDOPERA}</div>
                  </td>
                  <td className="px-2 py-2 whitespace-normal break-words text-sm text-center text-slate-600 font-mono">{nota.A1 ?? 0}</td>
                  <td className="px-2 py-2 whitespace-normal break-words text-sm text-center text-slate-600 font-mono">{nota.A2 ?? 0}</td>
                  <td className="px-2 py-2 whitespace-normal break-words text-sm text-center text-slate-600 font-mono">{nota.A3 ?? 0}</td>
                  <td className="px-2 py-2 whitespace-normal break-words text-sm text-center text-slate-600 font-mono">{nota.CE1 ?? 0}</td>
                  <td className="px-2 py-2 whitespace-normal break-words text-sm text-center text-slate-600 font-mono font-semibold">{nota.LOGRO ?? 0}%</td>
                  <td className="px-2 py-2 whitespace-normal break-words text-center">
                    {/* Alerta de color dinámica: Azul aprobados (>= 11), Rojo desaprobados (< 11) */}
                    <span className={`px-3 py-1.5 inline-flex text-sm font-black rounded-lg border ${
                      (nota.FINAL ?? 0) >= 11 
                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {String(nota.FINAL).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="min-w-[260px] whitespace-normal break-words px-3 py-3 text-sm text-slate-500">
                    {nota.OBSERVACION || <span className="text-slate-300 italic">Ninguna</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
