
"use client";

import Link from "next/link";

import type { NotaAlumno } from "@/app/actions/notas";
import type { DetalleOperacionNotas } from "@/app/actions/notas-gestion";

type Props = {
  operacion: DetalleOperacionNotas;
  notas: NotaAlumno[];
};

const ALUMNOS_POR_PAGINA = 20;

function fecha(valor: Date | string | null | undefined) {
  if (!valor) return "—";

  const texto = String(valor);
  const coincidencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (coincidencia) {
    return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
  }

  const fechaValor = new Date(valor);

  if (Number.isNaN(fechaValor.getTime())) return "—";

  return [
    String(fechaValor.getUTCDate()).padStart(2, "0"),
    String(fechaValor.getUTCMonth() + 1).padStart(2, "0"),
    fechaValor.getUTCFullYear(),
  ].join("/");
}

function nota(valor: number | null | undefined) {
  if (valor === null || valor === undefined || Number(valor) === 0) {
    return "";
  }

  return String(valor);
}

export default function ImprimirReporteNotasCurso({
  operacion,
  notas,
}: Props) {
  const anio = notas.find((item) => item.ANIO !== null)?.ANIO ?? "—";

  // Distribuir los alumnos en grupos de 20 por hoja.
  const paginasNotas = Array.from(
    {
      length: Math.max(
        1,
        Math.ceil(notas.length / ALUMNOS_POR_PAGINA)
      ),
    },
    (_, indice) =>
      notas.slice(
        indice * ALUMNOS_POR_PAGINA,
        (indice + 1) * ALUMNOS_POR_PAGINA
      )
  );

  return (
    <main className="report-main min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="no-print mx-auto mb-5 flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3">
        <Link
          href={`/notas/curso/${operacion.IDOPERA}`}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← Volver al registro de notas
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="report-pages">
        {paginasNotas.map((notasPagina, paginaIndice) => (
          <article
            key={paginaIndice}
            className={`report-sheet mx-auto mb-6 w-full max-w-[1500px] bg-white p-8 shadow-lg ${
              paginaIndice === paginasNotas.length - 1
                ? "last-page"
                : ""
            }`}
          >
            <header className="mb-4">
              <div className="mb-3 flex items-center justify-between gap-5">
                <div className="flex h-[75px] w-[230px] items-center justify-center rounded-md px-5 py-2">
                  <img
                    src="/logo.png"
                    alt="Logo de la institución"
                    className="max-h-[58px] max-w-full object-contain"
                  />
                </div>

                <div className="text-right text-xs text-slate-500">
                  <p>Registro académico</p>
                  <p>Operación: {operacion.IDOPERA}</p>
                </div>
              </div>

              <h1 className="mb-4 text-center text-xl font-bold tracking-wide text-slate-900">
                REGISTRO DE EVALUACIÓN DEL EDUCANDO - CICLO MEDIO
              </h1>

              <table className="w-full border-collapse text-xs">
                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      className="w-1/2 border border-slate-400 bg-slate-100 px-3 py-2"
                    >
                      <strong>AÑO:</strong> {anio}
                    </td>

                    <td
                      rowSpan={2}
                      className="w-1/2 border border-slate-400 bg-slate-50 px-3 py-2 text-center align-middle"
                    >
                      <strong className="block text-[10px] uppercase text-slate-500">
                        Módulo
                      </strong>
                      <span className="font-semibold">
                        {operacion.DES_MODULO || "—"}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={2}
                      className="border border-slate-400 px-3 py-2"
                    >
                      <strong>PROFESOR:</strong> {operacion.NOM_DOCENTE}
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={2}
                      className="border border-slate-400 bg-slate-100 px-3 py-2"
                    >
                      <strong>HORARIO:</strong>{" "}
                      {operacion.DESHORARIO || "—"}
                    </td>

                    <td
                      rowSpan={2}
                      className="border border-slate-400 bg-slate-50 px-3 py-2 text-center align-middle"
                    >
                      <strong className="block text-[10px] uppercase text-slate-500">
                        Asignatura
                      </strong>
                      <span className="font-semibold">
                        {operacion.DES_ASIGNATURA || "—"}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="w-1/4 border border-slate-400 bg-slate-100 px-3 py-2">
                      <strong>DESDE:</strong> {fecha(operacion.DESDE)}
                    </td>

                    <td className="w-1/4 border border-slate-400 bg-slate-100 px-3 py-2">
                      <strong>HASTA:</strong> {fecha(operacion.HASTA)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </header>

            <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
              <p>
                <strong>{notasPagina.length}</strong> alumnos en esta hoja
                {" · "}
                {notas.length} alumnos en total
              </p>

              <p>
                Carrera: {operacion.DES_CARRERA || "—"}
              </p>
            </div>

            <table className="grades-table w-full border-collapse text-center">
              <thead>
                <tr>
                  <th rowSpan={2} className="number-column">
                    Nro
                  </th>

                  <th rowSpan={2} className="student-column">
                    ALUMNOS
                  </th>

                  <th colSpan={3} className="group-ce1">
                    CRITERIO DE EVALUACIÓN 1
                  </th>

                  <th rowSpan={2} className="final-column">
                    NOTA CE1
                  </th>

                  <th colSpan={6} className="group-ce2">
                    CRITERIO DE EVALUACIÓN 2
                  </th>

                  <th rowSpan={2} className="final-column">
                    NOTA CE2
                  </th>

                  <th rowSpan={2}>LOGRO</th>

                  <th rowSpan={2} className="observation-column">
                    OBSERVAC.
                  </th>

                  <th rowSpan={2}>FALT.</th>
                </tr>

                <tr>
                  {[
                    "A1",
                    "A2",
                    "A3",
                    "A4",
                    "A5",
                    "A6",
                    "C",
                    "M",
                    "FINAL",
                  ].map((campo) => (
                    <th key={campo}>{campo}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {notasPagina.map((item, indice) => {
                  const numeroGlobal =
                    paginaIndice * ALUMNOS_POR_PAGINA + indice + 1;

                  return (
                    <tr key={item.IDNOTA}>
                      <td>{numeroGlobal}</td>

                      <td className="student-name">
                        <span className="student-full-name">
                          {item.ALUMNO}
                        </span>
                        <span className="student-code">
                          {item.CODALUMNO}
                        </span>
                      </td>

                      <td>{nota(item.A1)}</td>
                      <td>{nota(item.A2)}</td>
                      <td>{nota(item.A3)}</td>
                      <td className="calculated-cell">
                        {nota(item.CE1)}
                      </td>

                      <td>{nota(item.A4)}</td>
                      <td>{nota(item.A5)}</td>
                      <td>{nota(item.A6)}</td>
                      <td>{nota(item.C2)}</td>
                      <td>{nota(item.M2)}</td>
                      <td>{nota(item.FINAL)}</td>

                      <td className="calculated-cell">
                        {nota(item.CE2)}
                      </td>

                      <td className="calculated-cell">
                        {nota(item.LOGRO)}
                      </td>

                      <td className="observation-cell">
                        {item.OBSERVACION || ""}
                      </td>

                      <td>{Number(item.FALTA ?? 0)}</td>
                    </tr>
                  );
                })}

                {notas.length === 0 && (
                  <tr>
                    <td colSpan={16} className="py-8 text-center">
                      No hay alumnos registrados en esta operación.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <footer className="mt-3 flex justify-between border-t border-slate-300 pt-2 text-[10px] text-slate-500">
              <span>Registro de evaluación del educando</span>

              <span>
                Operación: {operacion.IDOPERA} · Página{" "}
                {paginaIndice + 1} de {paginasNotas.length}
              </span>
            </footer>
          </article>
        ))}
      </div>

      <style jsx global>{`
        .report-pages {
          width: 100%;
          display: block;
        }

        .report-sheet {
          box-sizing: border-box;
        }

        .grades-table {
          font-size: 10px;
          table-layout: fixed;
        }

        .grades-table th,
        .grades-table td {
          border: 1px solid #64748b;
          padding: 5px 3px;
          vertical-align: middle;
          line-height: 1.15;
        }

        .grades-table thead th {
          background: #e8eef5;
          color: #172554;
          font-weight: 700;
        }

        .grades-table thead .group-ce1 {
          background: #dbeafe;
        }

        .grades-table thead .group-ce2 {
          background: #dcfce7;
        }

        .grades-table thead .final-column {
          background: #e2e8f0;
        }

        .grades-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }

        .grades-table .number-column {
          width: 3%;
        }

        .grades-table .student-column {
          width: 19%;
        }

        .grades-table .student-name {
          text-align: left;
          padding-left: 6px;
        }

        .student-full-name {
          display: block;
          font-weight: 600;
        }

        .student-code {
          display: block;
          color: #64748b;
          font-size: 8px;
        }

        .grades-table .calculated-cell {
          background: #f1f5f9;
          font-weight: 700;
        }

        .grades-table .observation-column {
          width: 12%;
        }

        .grades-table .observation-cell {
          text-align: left;
          overflow-wrap: anywhere;
        }

        @page {
          size: A4 landscape;
          margin: 5mm;
        }

        @media print {
          html,
          body {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .report-pages,
          .report-pages * {
            visibility: visible !important;
          }

          .no-print {
            display: none !important;
          }

          .report-main {
            display: block !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .report-pages {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .report-sheet {
            position: relative !important;
            display: block !important;

            width: 100% !important;
            max-width: 287mm !important;
            min-height: 0 !important;
            height: auto !important;

            margin: 0 auto !important;
            padding: 3mm !important;

            box-sizing: border-box !important;
            overflow: visible !important;
            box-shadow: none !important;
            background: white !important;
          }

          .report-sheet:not(.last-page) {
            break-after: page !important;
            page-break-after: always !important;
          }

          .report-sheet header {
            margin-bottom: 2mm !important;
          }

          .report-sheet header > div:first-child {
            margin-bottom: 2mm !important;
          }

          .report-sheet header img {
            max-width: 43mm !important;
            max-height: 14mm !important;
            object-fit: contain !important;
          }

          .report-sheet h1 {
            margin-bottom: 2mm !important;
            font-size: 12px !important;
          }

          .report-sheet header table {
            font-size: 8px !important;
          }

          .report-sheet header table td {
            padding: 3px 5px !important;
          }

          .report-sheet > div {
            margin-bottom: 1mm !important;
            font-size: 8px !important;
          }

          .grades-table {
            width: 100% !important;
            font-size: 7px !important;
            table-layout: fixed !important;
          }

          .grades-table th,
          .grades-table td {
            padding: 2px 2px !important;
            line-height: 1.05 !important;
            overflow-wrap: anywhere !important;
          }

          .grades-table .student-column {
            width: 19% !important;
          }

          .grades-table .number-column {
            width: 3% !important;
          }

          .grades-table .observation-column {
            width: 12% !important;
          }

          .student-full-name {
            font-size: 7px !important;
          }

          .student-code {
            font-size: 6px !important;
          }

          .report-sheet footer {
            margin-top: 2mm !important;
            padding-top: 1mm !important;
            font-size: 7px !important;
          }

          .grades-table thead {
            display: table-header-group !important;
          }

          .grades-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </main>
  );
}
