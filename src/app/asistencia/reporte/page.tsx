
import Link from "next/link";
import Image from "next/image";
import { getReporteAsistencia } from "@/app/actions/asistencia";
import ImprimirAsistencia from "@/components/ImprimirAsistencia";

export const instant = false;

type Props = {
  searchParams: Promise<{
    docente?: string;
    curso?: string;
  }>;
};

export default async function ReporteAsistenciaPage({
  searchParams,
}: Props) {
  const parametros = await searchParams;

  const docente = parametros.docente?.trim() ?? "";
  const curso = parametros.curso?.trim() ?? "";

  if (!docente || !curso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">
            No se puede generar el reporte
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Debes seleccionar un docente y un curso antes de generar el reporte.
          </p>
          <Link
            href="/asistencia"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Volver a asistencia
          </Link>
        </div>
      </div>
    );
  }

  const reporte = await getReporteAsistencia(docente, curso);

  if (!reporte) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">
            No se encontró información
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            No se encontraron datos del docente y curso seleccionados.
          </p>
          <Link
            href="/asistencia"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Volver a asistencia
          </Link>
        </div>
      </div>
    );
  }

  const { cabecera, fechas, alumnos } = reporte;

  // Ajuste de densidad según el tamaño del reporte.
  const fontTabla = Math.max(
    5,
    Math.min(
      8,
      8 -
        Math.max(0, alumnos.length - 25) * 0.045 -
        Math.max(0, fechas.length - 12) * 0.06
    )
  );

  return (
    <main className="min-h-screen bg-slate-100 p-3 text-slate-900 sm:p-6">
      <style>{`
        .tabla-contenedor {
          max-height: 72vh;
          overflow: auto;
          border: 1px solid #cbd5e1;
          background: white;
        }

        .tabla-asistencia {
          width: max-content;
          min-width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 12px;
        }

        .tabla-asistencia th,
        .tabla-asistencia td {
          border-right: 1px solid #dbe2ea;
          border-bottom: 1px solid #dbe2ea;
          padding: 8px 9px;
          white-space: nowrap;
        }

        .tabla-asistencia thead th {
          position: sticky;
          top: 0;
          z-index: 5;
          background: #1e3a5f;
          color: white;
          font-weight: 700;
          text-align: center;
          height: 38px;
        }

        .tabla-asistencia tbody tr:nth-child(even) td {
          background: #f1f5f9;
        }

        .tabla-asistencia tbody tr:hover td {
          background: #dbeafe;
        }

        .tabla-asistencia .col-numero {
          position: sticky;
          left: 0;
          z-index: 3;
          min-width: 44px;
          width: 44px;
          text-align: center;
          background: #e2e8f0;
          font-weight: 600;
        }

        .tabla-asistencia .col-alumno {
          position: sticky;
          left: 44px;
          z-index: 3;
          min-width: 260px;
          text-align: left;
          background: #e2e8f0;
          font-weight: 700;
        }

        .tabla-asistencia thead .col-numero,
        .tabla-asistencia thead .col-alumno {
          z-index: 8;
          background: #172f4d;
          color: white;
        }

        .tabla-asistencia tbody tr:nth-child(even) .col-numero,
        .tabla-asistencia tbody tr:nth-child(even) .col-alumno {
          background: #e8eef5;
        }

        .tabla-asistencia .col-fecha,
        .tabla-asistencia .celda-marca {
          min-width: 58px;
          text-align: center;
          font-weight: 600;
        }

        @page {
          size: A4 landscape;
          margin: 5mm;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 landscape;
            margin: 5mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #111827 !important;
          }

          .no-print {
            display: none !important;
          }

          main {
            min-height: 0 !important;
            width: 1600px !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          .reporte-contenedor {
            width: 1600px !important;
            max-width: 1600px !important;
            margin: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
          }

          .tabla-contenedor {
            max-height: none !important;
            overflow: visible !important;
          }

          .tabla-asistencia th,
          .tabla-asistencia td {
            position: static !important;
          }

          .tabla-asistencia thead th {
            position: static !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-4 flex max-w-[1600px] items-center justify-between gap-3">
        <Link
          href="/asistencia"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <span>←</span>
          Volver a asistencia
        </Link>

        <ImprimirAsistencia />
      </div>

      <section className="reporte-contenedor mx-auto max-w-[1600px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="encabezado-reporte flex items-center gap-4 bg-[#172f4d] px-5 py-4 text-white">
          <Image
            src="/logo-2.png"
            alt="Logo del instituto"
            width={180}
            height={110}
            priority
            className="logo-reporte h-28 w-48 shrink-0 object-contain"          />

          <div className="min-w-0 flex-1 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Reporte académico
            </p>

            <h1 className="text-lg font-bold uppercase tracking-wide sm:text-2xl">
              Asistencia de los estudiantes - Ciclo Medio
            </h1>

            <p className="mt-2 text-sm font-semibold text-blue-100">
              {cabecera.asignatura}
            </p>

            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              {cabecera.modulo}
            </p>
          </div>
        </header>

        <div className="datos-reporte grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
          <div className="dato-reporte rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Docente
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {cabecera.docente}
            </p>
          </div>

          <div className="dato-reporte rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Asignatura / Curso
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {cabecera.asignatura}
            </p>
          </div>

          <div className="dato-reporte rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Año académico
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {cabecera.anio}
            </p>
          </div>

          <div className="dato-reporte rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Módulo
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {cabecera.modulo}
            </p>
          </div>

          <div className="dato-reporte rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Horario
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {cabecera.horario}
            </p>
          </div>

          <div className="dato-reporte rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Periodo
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {cabecera.desde} — {cabecera.hasta}
            </p>
          </div>
        </div>

        <div className="titulo-tabla flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Registro de asistencia
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Marcaciones por alumno y fecha.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <span className="rounded-md bg-blue-50 px-3 py-1.5 font-semibold text-blue-800">
              {alumnos.length} alumnos
            </span>
            <span className="rounded-md bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
              {fechas.length} fechas
            </span>
          </div>
        </div>

        <div className="tabla-contenedor">
          <table className="tabla-asistencia">
            <thead>
              <tr>
                <th className="col-numero">N°</th>
                <th className="col-alumno">APELLIDOS Y NOMBRES</th>

                {fechas.map((fecha) => (
                  <th key={fecha.clave} className="col-fecha">
                    {fecha.etiqueta}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {alumnos.map((alumno, indice) => (
                <tr key={alumno.codigo || indice}>
                  <td className="col-numero">
                    {alumno.orden || indice + 1}
                  </td>

                  <td className="col-alumno uppercase">
                    {alumno.nombre}
                  </td>

                  {fechas.map((fecha) => (
                    <td key={fecha.clave} className="celda-marca">
                      {alumno.marcaciones[fecha.clave] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}

              {alumnos.length === 0 && (
                <tr>
                  <td
                    colSpan={fechas.length + 2}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No hay alumnos registrados para este curso.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="resumen-reporte flex flex-wrap justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
          <span>
            <strong className="text-slate-700">Total de alumnos:</strong>{" "}
            {alumnos.length}
          </span>
          <span>
            <strong className="text-slate-700">Total de fechas:</strong>{" "}
            {fechas.length}
          </span>
          <span className="font-medium text-slate-600">
            Registro de asistencia académica
          </span>
        </footer>
      </section>
    </main>
  );
}
