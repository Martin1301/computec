
import Link from "next/link";
import { getOperacionesNotas } from "@/app/actions/notas";

type PageProps = {
  searchParams: Promise<{
    buscar?: string;
    pagina?: string;
  }>;
};

function formatearFecha(valor: Date | string | null): string {
  if (!valor) return "Sin fecha";

  // Si llega como cadena ISO, conservar directamente el día de SQL.
  const texto = String(valor);
  const coincidencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (coincidencia) {
    const [, anio, mes, dia] = coincidencia;
    return `${dia}/${mes}/${anio}`;
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const anio = fecha.getUTCFullYear();

  return `${dia}/${mes}/${anio}`;
}

export default async function NotasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const buscar = params.buscar ?? "";
  const paginaSolicitada = Math.max(1, Number(params.pagina) || 1);

  const resultado = await getOperacionesNotas(buscar, paginaSolicitada);

  const {
    operaciones,
    total,
    pagina,
    totalPaginas,
    porPagina,
  } = resultado;

  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  const construirUrl = (numeroPagina: number) => {
    const query = new URLSearchParams();

    if (buscar.trim()) {
      query.set("buscar", buscar);
    }

    query.set("pagina", String(numeroPagina));

    return `/notas?${query.toString()}`;
  };

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
    <div className="min-h-full space-y-6 bg-gray-50 p-6 text-gray-900">

      {/* ENCABEZADO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Registro de notas
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulta las operaciones académicas y administra las calificaciones
            de sus alumnos.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
          <span className="text-sm font-medium text-gray-700">
            {total} operaciones
          </span>
        </div>
      </div>

      {/* BUSCADOR */}
      <form method="GET" action="/notas" className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            name="buscar"
            defaultValue={buscar}
            placeholder="Buscar por operación, docente, asignatura, módulo o carrera..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Buscar
        </button>

        {buscar && (
          <Link
            href="/notas"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* RESULTADOS */}
      {operaciones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            No se encontraron operaciones
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {buscar
              ? "Intenta con otro término de búsqueda."
              : "Todavía no existen registros de notas para mostrar."}
          </p>
        </div>
      ) : (
        <>
          {/* TABLA */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-4">Operación</th>
                    <th className="px-4 py-4">Carrera / Módulo</th>
                    <th className="px-4 py-4">Asignatura</th>
                    <th className="px-4 py-4">Docente</th>
                    <th className="px-4 py-4">Horario</th>
                    <th className="px-4 py-4 text-center">Alumnos</th>
                    <th className="px-4 py-4 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {operaciones.map((operacion) => (
                    <tr
                      key={operacion.IDOPERA}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="font-semibold text-blue-700">
                          {operacion.IDOPERA}
                        </span>

                        <div className="mt-1 text-xs text-gray-500">
                          {operacion.ANIO ?? "Sin año"}
                        </div>
                      </td>

                      <td className="min-w-48 px-4 py-4">
                        <div className="font-medium text-gray-800">
                          {operacion.DES_CARRERA}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {operacion.DES_MODULO}
                        </div>
                      </td>

                      <td className="min-w-48 px-4 py-4 font-medium text-gray-800">
                        {operacion.DES_ASIGNATURA}
                      </td>

                      <td className="min-w-40 px-4 py-4 text-gray-700">
                        {operacion.NOM_DOCENTE}
                      </td>

                      <td className="min-w-36 px-4 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          {operacion.DESHORARIO}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatearFecha(operacion.DESDE)} - {formatearFecha(operacion.HASTA)}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                          {operacion.CANTIDAD_ALUMNOS}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/notas/curso/${encodeURIComponent(operacion.IDOPERA)}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Ver notas
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINACIÓN */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {desde}–{hasta} de {total} operaciones
            </p>

            {totalPaginas > 1 && (
              <nav
                aria-label="Paginación de operaciones"
                className="flex flex-wrap items-center justify-center gap-1"
              >
                {pagina > 1 ? (
                  <Link
                    href={construirUrl(pagina - 1)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Anterior
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-400">
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
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {numero}
                  </Link>
                ))}

                {pagina < totalPaginas ? (
                  <Link
                    href={construirUrl(pagina + 1)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Siguiente
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-400">
                    Siguiente
                  </span>
                )}
              </nav>
            )}
          </div>
        </>
      )}
    </div>
  );
}
