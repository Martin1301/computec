import Link from "next/link";
import Image from "next/image";
import { getReporteCarreras } from "@/app/actions/reporte-carreras";

export const instant = false;

type Props = {
  searchParams: Promise<{
    nombres?: string;
  }>;
};

export default async function ReporteCarrerasPage({
  searchParams,
}: Props) {
  const parametros = await searchParams;
  const nombres = parametros.nombres?.trim() ?? "";

  const carreras = await getReporteCarreras(nombres);

  return (
    <main className="min-h-screen bg-slate-100 p-3 text-slate-900 sm:p-6">
      <style>{`
        .reporte-carreras {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .reporte-carreras th {
          background: #1e3a5f;
          color: white;
          font-weight: 700;
          text-align: left;
          padding: 11px 12px;
          border: 1px solid #cbd5e1;
        }

        .reporte-carreras td {
          padding: 10px 12px;
          border: 1px solid #dbe2ea;
          vertical-align: middle;
        }

        .reporte-carreras tbody tr:nth-child(even) {
          background: #f1f5f9;
        }

        .reporte-carreras tbody tr:hover {
          background: #dbeafe;
        }

        @page {
          size: A4 portrait;
          margin: 15mm;
        }

        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-imprimir {
            display: none !important;
          }

          .reporte-contenedor {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            max-width: none !important;
          }

          .reporte-carreras {
            width: 100% !important;
            table-layout: fixed;
            font-size: 10px !important;
          }

          .reporte-carreras th,
          .reporte-carreras td {
            padding: 8px 10px !important;
          }

          .reporte-carreras thead {
            display: table-header-group;
          }

          .reporte-carreras tr {
            break-inside: avoid;
          }

          .encabezado-reporte {
            margin-bottom: 18px !important;
          }

          .logo-reporte {
            width: 38mm !important;
            height: 23mm !important;
            object-fit: contain !important;
          }

          .titulo-reporte {
            font-size: 18px !important;
          }

          .resumen-reporte {
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Barra de acciones */}
      <div className="no-imprimir mx-auto mb-5 flex max-w-[1100px] flex-wrap items-center justify-between gap-3">
        <Link
          href="/carreras"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Volver a carreras
        </Link>

        <div className="flex flex-wrap gap-2">
          <form
            action="/carreras/reporte"
            method="GET"
            className="flex flex-wrap gap-2"
          >
            <input
              type="search"
              name="nombres"
              defaultValue={nombres}
              placeholder="Buscar carrera por nombre..."
              className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              🔎 Buscar
            </button>

            {nombres && (
              <Link
                href="/carreras/reporte"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* Documento */}
      <section className="reporte-contenedor mx-auto max-w-[1100px] overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {/* Cabecera */}
        <div className="encabezado-reporte mb-7 flex items-center gap-5 border-b-2 border-slate-700 pb-5">
          <Image
            src="/logo-2.png"
            alt="Logo de la empresa"
            width={180}
            height={110}
            priority
            className="logo-reporte h-24 w-40 shrink-0 object-contain"
          />

          <div className="min-w-0 flex-1 text-center">
            <h1 className="titulo-reporte text-2xl font-extrabold uppercase tracking-wide text-slate-800">
              Lista de carreras
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-600">
              Registro general de carreras académicas
            </p>

            {nombres && (
              <p className="mt-1 text-sm text-slate-500">
                Búsqueda: <strong>{nombres}</strong>
              </p>
            )}
          </div>

          <div className="hidden min-w-[110px] text-right text-xs text-slate-500 sm:block">
            <p>Fecha de emisión</p>
            <p className="mt-1 font-semibold text-slate-700">
              {new Date().toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "America/Lima",
              })}
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="resumen-reporte mb-5 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p>
            Total de carreras:{" "}
            <strong className="text-slate-900">
              {carreras.length}
            </strong>
          </p>

          <p>Ordenado por código</p>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="reporte-carreras">
            <thead>
              <tr>
                <th className="w-[110px]">Código</th>
                <th>Nombre de carrera</th>
                <th className="w-[130px] text-center">Estado</th>
              </tr>
            </thead>

            <tbody>
              {carreras.map((carrera) => (
                <tr key={carrera.codigo}>
                  <td className="font-semibold text-slate-700">
                    {carrera.codigo}
                  </td>

                  <td className="font-medium text-slate-800">
                    {carrera.nombre}
                  </td>

                  <td className="text-center">
                    <span
                      className={
                        carrera.estado === "A"
                          ? "font-semibold text-emerald-700"
                          : "font-semibold text-rose-700"
                      }
                    >
                      {carrera.estado === "A" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}

              {carreras.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No se encontraron carreras con el nombre consultado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-6 border-t border-slate-200 pt-3 text-right text-xs text-slate-500">
          Reporte generado desde el sistema de gestión académica.
        </footer>
      </section>
    </main>
  );
}
