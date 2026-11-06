
import Link from "next/link";
import { getAlumnos } from "@/app/actions/alumnos";

export const instant = false;

type Props = {
  searchParams: Promise<{
    buscar?: string;
    pagina?: string;
  }>;
};

export default async function AlumnosPage({ searchParams }: Props) {
  const parametros = await searchParams;

  const buscar = parametros.buscar?.trim() ?? "";
  const paginaSolicitada = Math.max(1, Number(parametros.pagina) || 1);

  const resultado = await getAlumnos(buscar, paginaSolicitada);

  const {
    alumnos,
    total,
    pagina,
    totalPaginas,
    porPagina,
  } = resultado;

  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  // Mantener la búsqueda al navegar entre páginas.
  const construirUrl = (numeroPagina: number) => {
    const query = new URLSearchParams();

    if (buscar) {
      query.set("buscar", buscar);
    }

    query.set("pagina", String(numeroPagina));

    return `/alumnos?${query.toString()}`;
  };

  // Mostrar hasta cinco números de página.
  const inicioPaginas = Math.max(
    1,
    Math.min(pagina - 2, totalPaginas - 4)
  );

  const finPaginas = Math.min(totalPaginas, inicioPaginas + 4);

  const numerosPaginas = Array.from(
    { length: finPaginas - inicioPaginas + 1 },
    (_, indice) => inicioPaginas + indice
  );

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Módulo de Alumnos
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestión de matrículas y datos personales
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

          <Link
            href="/alumnos/informe-cursos"
            className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
          >
            📚 Informe de cursos por alumno
          </Link>

          <Link
            href="/alumnos/nuevo"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            ➕ Registrar Alumno
          </Link>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          action="/alumnos"
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              name="buscar"
              defaultValue={buscar}
              placeholder="Buscar por código, apellidos, nombres o correo..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:flex-none"
            >
              🔎 Buscar
            </button>

            {buscar && (
              <Link
                href="/alumnos"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
              >
                Limpiar
              </Link>
            )}
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            {buscar ? (
              <>
                Resultados para:{" "}
                <span className="font-semibold text-slate-800">
                  {buscar}
                </span>
              </>
            ) : (
              "Mostrando todos los alumnos registrados"
            )}
          </p>

          <p className="text-sm font-semibold text-slate-700">
            Total: {total} alumnos
          </p>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[1000px] table-auto divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="w-[130px] whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Código
                </th>

                <th className="min-w-[240px] whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Apellidos y Nombres
                </th>

                <th className="min-w-[260px] whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Email
                </th>

                <th className="w-[130px] whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Estado
                </th>

                <th className="w-[240px] whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {alumnos.map((alumno) => (
                <tr
                  key={alumno.CODALUMNO}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="whitespace-normal break-words px-2 py-2 text-sm font-bold text-slate-700">
                    {alumno.CODALUMNO}
                  </td>

                  <td className="whitespace-normal break-words px-2 py-2 text-sm font-medium text-gray-800">
                    {alumno.APELLIDO_PAT} {alumno.APELLIDO_MAT},{" "}
                    {alumno.NOMBRES}
                  </td>

                  <td className="whitespace-normal break-words px-2 py-2 text-sm text-gray-600">
                    {alumno.EMAIL || (
                      <span className="italic text-gray-400">
                        No registrado
                      </span>
                    )}
                  </td>

                  <td className="whitespace-normal break-words px-2 py-2 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 ${
                        alumno.ESTADO === "A"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {alumno.ESTADO === "A" ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/alumnos/editar/${alumno.CODALUMNO}`}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-3 py-2 text-blue-600 transition hover:bg-blue-100 hover:text-blue-800"
                      >
                        ✏️ Editar
                      </Link>

                      <Link
                        href={`/notas/${alumno.CODALUMNO}`}
                        className="inline-flex items-center justify-center rounded-lg bg-amber-50 px-3 py-2 text-amber-600 transition hover:bg-amber-100 hover:text-amber-800"
                      >
                        📋 Notas
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {alumnos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No se encontraron alumnos.
                    <p className="mt-1 text-xs">
                      Verifica el código, apellido, nombre o correo ingresado.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Mostrando {desde}–{hasta} de {total} alumnos
        </p>

        {totalPaginas > 1 && (
          <nav
            aria-label="Paginación de alumnos"
            className="flex flex-wrap items-center justify-center gap-1"
          >
            {pagina > 1 ? (
              <Link
                href={construirUrl(pagina - 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Anterior
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-400">
                Anterior
              </span>
            )}

            {numerosPaginas.map((numero) => (
              <Link
                key={numero}
                href={construirUrl(numero)}
                aria-current={numero === pagina ? "page" : undefined}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  numero === pagina
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {numero}
              </Link>
            ))}

            {pagina < totalPaginas ? (
              <Link
                href={construirUrl(pagina + 1)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Siguiente
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-400">
                Siguiente
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
