import { crearCatalogo, actualizarCatalogo, eliminarCatalogo, getCatalogo } from "@/app/actions/catalogos"

const titulos = { carreras: "Carreras", modulos: "Módulos", asignaturas: "Asignaturas" } as const
const descripciones = {
  carreras: "Administra las carreras académicas del sistema.",
  modulos: "Administra los módulos o niveles académicos.",
  asignaturas: "Administra las asignaturas disponibles para organizar los cursos.",
} as const

export default async function CatalogoPage({ tipo }: { tipo: "carreras" | "modulos" | "asignaturas" }) {
  const registros = await getCatalogo(tipo)
  return <section className="space-y-6">
    <header className="flex flex-col gap-1 border-b border-slate-200 pb-5">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Mantenimiento académico</p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{titulos[tipo]}</h1>
      <p className="text-sm text-slate-500">{descripciones[tipo]}</p>
    </header>
    <form action={crearCatalogo} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-[1fr_180px_auto] md:items-end">
      <input type="hidden" name="tipo" value={tipo} />
      <label className="block text-sm font-semibold text-slate-700">Nombre
        <input name="nombre" required maxLength={tipo === "carreras" ? 30 : 100} placeholder={`Nombre de ${titulos[tipo].toLowerCase()}`} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
      </label>
      <label className="block text-sm font-semibold text-slate-700">Estado
        <select name="estado" defaultValue="A" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"><option value="A">Activo</option><option value="I">Inactivo</option></select>
      </label>
      <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">Registrar</button>
    </form>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-bold text-slate-900">Registros existentes</h2><p className="text-xs text-slate-500">Los cambios se guardan en SQL Server.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{registros.length} registros</span></div>
      <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Código</th><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</th><th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Estado</th><th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Acciones</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{registros.map((r) => <tr key={r.codigo} className="transition hover:bg-blue-50/40"><td className="whitespace-nowrap px-5 py-3 text-sm font-bold text-slate-700">{r.codigo}</td><td className="min-w-64 px-5 py-3"><form action={actualizarCatalogo} className="flex min-w-64 items-center gap-2"><input type="hidden" name="tipo" value={tipo}/><input type="hidden" name="codigo" value={r.codigo}/><input name="nombre" defaultValue={r.nombre} required maxLength={tipo === "carreras" ? 30 : 100} aria-label={`Nombre ${r.codigo}`} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none hover:border-slate-200 focus:border-blue-400 focus:bg-white"/><select name="estado" defaultValue={r.estado === "A" ? "A" : "I"} aria-label={`Estado ${r.codigo}`} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"><option value="A">Activo</option><option value="I">Inactivo</option></select><button className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">Guardar</button></form></td><td className="whitespace-nowrap px-5 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${r.estado === "A" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{r.estado === "A" ? "Activo" : "Inactivo"}</span></td><td className="whitespace-nowrap px-5 py-3 text-right"><form action={eliminarCatalogo} className="inline"><input type="hidden" name="tipo" value={tipo}/><input type="hidden" name="codigo" value={r.codigo}/><button className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">Anular</button></form></td></tr>)}
      {registros.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-500">No hay registros para mostrar.</td></tr>}</tbody></table></div>
    </div>
    <p className="text-xs leading-5 text-slate-500">Nota: la opción «Anular» utiliza los procedimientos almacenados originales del sistema. No elimina físicamente los registros.</p>
  </section>
}
