"use client";

import { useMemo, useState } from "react";
import {
  getNotasByAlumno,
  type NotaAlumno,
} from "@/app/actions/notas";
import type { AlumnoInforme } from "@/app/actions/consultas";

type Props = {
  alumnos: AlumnoInforme[];
};

function fechaTexto(fecha: Date | null) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Lima",
  });
}

function texto(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined || valor === "") {
    return "—";
  }

  return String(valor);
}

export default function InformeCursosAlumnoClient({ alumnos }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [codigoSeleccionado, setCodigoSeleccionado] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] =
    useState<AlumnoInforme | null>(null);
  const [notas, setNotas] = useState<NotaAlumno[]>([]);
  const [cargando, setCargando] = useState(false);
  const [consultado, setConsultado] = useState(false);
  const [error, setError] = useState("");

  const alumnosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");

    if (!termino) return alumnos;

    return alumnos.filter((alumno) =>
      `${alumno.CODALUMNO} ${alumno.NOMBRECOMPLETO}`
        .toLocaleLowerCase("es")
        .includes(termino)
    );
  }, [alumnos, busqueda]);

  async function consultarAlumno(codigo: string) {
    setCodigoSeleccionado(codigo);
    setNotas([]);
    setConsultado(false);
    setError("");

    const alumno =
      alumnos.find((item) => item.CODALUMNO === codigo) ?? null;

    setAlumnoSeleccionado(alumno);

    if (!codigo || !alumno) return;

    setCargando(true);

    try {
      const resultado = await getNotasByAlumno(codigo);
      setNotas(resultado);
      setConsultado(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo consultar el historial académico del alumno.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .informe-cursos-tabla {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .informe-cursos-tabla th {
          padding: 10px 8px;
          background: #1e3a5f;
          color: #fff;
          border: 1px solid #cbd5e1;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .informe-cursos-tabla td {
          padding: 9px 8px;
          border: 1px solid #dbe2ea;
          vertical-align: top;
          color: #334155;
        }

        .informe-cursos-tabla tbody tr:nth-child(even) {
          background: #f8fafc;
        }

        .informe-cursos-tabla .centrado {
          text-align: center;
          white-space: nowrap;
        }

        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .no-imprimir {
            display: none !important;
          }

          .print-encabezado {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            margin-bottom: 10px !important;
            padding-bottom: 8px !important;
            border-bottom: 2px solid #334155 !important;
          }

          .print-logo {
            width: 35mm !important;
            height: 22mm !important;
            object-fit: contain !important;
          }

          .print-titulo {
            font-size: 16px !important;
          }

          .print-datos {
            margin: 8px 0 12px !important;
            font-size: 10px !important;
          }

          .informe-cursos-tabla {
            width: 100% !important;
            table-layout: fixed !important;
            font-size: 8px !important;
          }

          .informe-cursos-tabla th {
            padding: 5px 3px !important;
            font-size: 7px !important;
            overflow-wrap: anywhere !important;
          }

          .informe-cursos-tabla td {
            padding: 4px 3px !important;
            font-size: 8px !important;
            overflow-wrap: anywhere !important;
            word-break: normal !important;
          }

          .informe-cursos-tabla thead {
            display: table-header-group !important;
          }

          .informe-cursos-tabla tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Encabezado de la pantalla */}
      <div className="no-imprimir flex flex-col gap-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Informe de cursos por alumno
        </h1>
        <p className="text-sm text-slate-500">
          Consulta el historial de cursos, docentes y calificaciones de cada alumno.
        </p>
      </div>

      {/* Buscador y selector */}
      <section className="no-imprimir rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div>
            <label
              htmlFor="buscar-alumno-informe"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Buscar alumno
            </label>
            <input
              id="buscar-alumno-informe"
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Código o apellidos y nombres..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              {alumnosFiltrados.length} alumnos encontrados
            </p>
          </div>

          <div>
            <label
              htmlFor="seleccionar-alumno-informe"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Seleccionar alumno
            </label>
            <select
              id="seleccionar-alumno-informe"
              value={codigoSeleccionado}
              onChange={(event) => consultarAlumno(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Seleccione un alumno...</option>
              {alumnosFiltrados.map((alumno) => (
                <option
                  key={alumno.CODALUMNO}
                  value={alumno.CODALUMNO}
                >
                  {alumno.CODALUMNO} — {alumno.NOMBRECOMPLETO}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Estados de consulta */}
      {cargando && (
        <div className="no-imprimir rounded-xl border border-blue-200 bg-blue-50 p-5 text-center text-sm font-medium text-blue-700">
          Consultando historial académico...
        </div>
      )}

      {error && (
        <div className="no-imprimir rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!codigoSeleccionado && !cargando && (
        <div className="no-imprimir rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="text-4xl">📚</div>
          <h2 className="mt-3 text-lg font-semibold text-slate-800">
            Selecciona un alumno
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Aquí aparecerá el historial de cursos y calificaciones.
          </p>
        </div>
      )}

      {consultado && alumnoSeleccionado && (
        <>
          {/* Resumen y botón de impresión */}
          <div className="no-imprimir flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Alumno seleccionado
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {alumnoSeleccionado.NOMBRECOMPLETO}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Código: {alumnoSeleccionado.CODALUMNO}
                {" · "}
                {notas.length} cursos registrados
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              🖨️ Imprimir / Guardar PDF
            </button>
          </div>

          {/* Documento de impresión y tabla */}
          <section className="print-area overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="print-encabezado mb-5 flex items-center gap-4 border-b-2 border-slate-700 pb-4">
              <img
                src="/logo.png"
                alt="Logo de la empresa"
                className="print-logo h-24 w-40 shrink-0 object-contain"
              />

              <div className="min-w-0 flex-1 text-center">
                <h2 className="print-titulo text-xl font-extrabold uppercase tracking-wide text-slate-800">
                  Informe de alumno
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Historial de cursos realizados
                </p>
              </div>
            </div>

            <div className="print-datos mb-5 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-2">
              <p>
                <strong className="text-slate-700">Código:</strong>{" "}
                <span className="text-slate-900">
                  {alumnoSeleccionado.CODALUMNO}
                </span>
              </p>
              <p>
                <strong className="text-slate-700">
                  Apellidos y nombres:
                </strong>{" "}
                <span className="text-slate-900">
                  {alumnoSeleccionado.NOMBRECOMPLETO}
                </span>
              </p>
            </div>

            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Cursos registrados
              </h3>
              <span className="text-xs text-slate-500">
                Total: {notas.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="informe-cursos-tabla">
                <thead>
                  <tr>
                    <th style={{ width: "14%" }}>Carrera</th>
                    <th style={{ width: "12%" }}>Módulo</th>
                    <th style={{ width: "17%" }}>Asignatura</th>
                    <th style={{ width: "15%" }}>Docente</th>
                    <th className="centrado" style={{ width: "9%" }}>Desde</th>
                    <th className="centrado" style={{ width: "9%" }}>Hasta</th>
                    <th className="centrado no-imprimir" style={{ width: "7%" }}>Final</th>
                    <th className="centrado" style={{ width: "7%" }}>Logro</th>
                    <th style={{ width: "10%" }}>Observación</th>
                  </tr>
                </thead>

                <tbody>
                  {notas.map((nota) => (
                    <tr key={nota.IDNOTA}>
                      <td>{texto(nota.DES_CARRERA)}</td>
                      <td>{texto(nota.DES_MODULO)}</td>
                      <td>{texto(nota.DES_ASIGNATURA)}</td>
                      <td>{texto(nota.NOM_DOCENTE)}</td>
                      <td className="centrado">{fechaTexto(nota.DESDE)}</td>
                      <td className="centrado">{fechaTexto(nota.HASTA)}</td>
                      <td className="centrado no-imprimir font-bold">
                        {texto(nota.FINAL)}
                      </td>
                      <td className="centrado">{texto(nota.LOGRO)}</td>
                      <td>{texto(nota.OBSERVACION)}</td>
                    </tr>
                  ))}

                  {notas.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center italic text-slate-500">
                        El alumno no registra cursos ni calificaciones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
