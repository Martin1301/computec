"use client";

import { useEffect, useState } from "react";
import {
  actualizarMarcacion,
  eliminarMarcacion,
  getCursosAsistencia,
  getMarcacionesAsistencia,
  type CursoAsistencia,
  type DocenteAsistencia,
  type MarcacionAsistencia,
} from "@/app/actions/asistencia";

type Props = {
  docentes: DocenteAsistencia[];
};

function obtenerFechaActual() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export default function AsistenciaClient({ docentes }: Props) {
  const [docente, setDocente] = useState(docentes[0]?.codigo ?? "");
  const [curso, setCurso] = useState("");
  const [busquedaCurso, setBusquedaCurso] = useState("");
  const [mostrarResultadosCurso, setMostrarResultadosCurso] = useState(false);
  const [fecha, setFecha] = useState(obtenerFechaActual());

  const [cursos, setCursos] = useState<CursoAsistencia[]>([]);
  const [marcaciones, setMarcaciones] = useState<MarcacionAsistencia[]>([]);

  const [cargandoCursos, setCargandoCursos] = useState(false);
  const [cargandoMarcaciones, setCargandoMarcaciones] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [marcacionEditando, setMarcacionEditando] =
    useState<MarcacionAsistencia | null>(null);
  const [nuevaHora, setNuevaHora] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarCursos() {
      setCursos([]);
      setCurso("");
      setBusquedaCurso("");
      setMostrarResultadosCurso(false);
      setMarcaciones([]);
      setMensaje("");
      setError("");

      if (!docente) return;

      setCargandoCursos(true);

      try {
        const resultado = await getCursosAsistencia(docente);

        if (!cancelado) {
          setCursos(resultado);
        }
      } catch {
        if (!cancelado) {
          setError("No se pudieron cargar los cursos del docente.");
        }
      } finally {
        if (!cancelado) {
          setCargandoCursos(false);
        }
      }
    }

    cargarCursos();

    return () => {
      cancelado = true;
    };
  }, [docente]);

  useEffect(() => {
    let cancelado = false;

    async function cargarMarcaciones() {
      setMarcaciones([]);
      setMensaje("");
      setError("");

      if (!docente || !curso || !fecha) return;

      setCargandoMarcaciones(true);

      try {
        const resultado = await getMarcacionesAsistencia(
          docente,
          curso,
          fecha
        );

        if (!cancelado) {
          setMarcaciones(resultado);
        }
      } catch {
        if (!cancelado) {
          setError("No se pudieron consultar las marcaciones.");
        }
      } finally {
        if (!cancelado) {
          setCargandoMarcaciones(false);
        }
      }
    }

    cargarMarcaciones();

    return () => {
      cancelado = true;
    };
  }, [docente, curso, fecha]);

  function abrirEdicion(marcacion: MarcacionAsistencia) {
    setMarcacionEditando(marcacion);
    setNuevaHora(marcacion.hora);
    setMensaje("");
    setError("");
  }

  async function guardarEdicion() {
    if (!marcacionEditando) return;

    setProcesando(true);
    setMensaje("");
    setError("");

    try {
      const resultado = await actualizarMarcacion(
        marcacionEditando.id,
        nuevaHora.trim()
      );

      if (!resultado.success) {
        setError(resultado.mensaje);
        return;
      }

      setMarcacionEditando(null);
      setMensaje(resultado.mensaje || "Marcación actualizada correctamente.");

      const actualizadas = await getMarcacionesAsistencia(
        docente,
        curso,
        fecha
      );
      setMarcaciones(actualizadas);
    } catch {
      setError("Ocurrió un error al actualizar la marcación.");
    } finally {
      setProcesando(false);
    }
  }

  async function eliminar(id: string) {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar esta marcación? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    setProcesando(true);
    setMensaje("");
    setError("");

    try {
      const resultado = await eliminarMarcacion(id);

      if (!resultado.success) {
        setError(resultado.mensaje);
        return;
      }

      setMensaje(resultado.mensaje || "Marcación eliminada correctamente.");

      const actualizadas = await getMarcacionesAsistencia(
        docente,
        curso,
        fecha
      );
      setMarcaciones(actualizadas);
    } catch {
      setError("Ocurrió un error al eliminar la marcación.");
    } finally {
      setProcesando(false);
    }
  }

  const nombreDocente =
    docentes.find((item) => item.codigo === docente)?.nombre ?? "";

  const cursoSeleccionado = cursos.find((item) => item.codigo === curso);

  function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  }

  const cursosFiltrados = cursos.filter((item) => {
    const termino = normalizarTexto(busquedaCurso);

    if (!termino) return true;

    const codigoCurso = normalizarTexto(String(item.codigo));
    const asignatura = normalizarTexto(item.asignatura ?? "");
    const modulo = normalizarTexto(item.modulo ?? "");
    const horario = normalizarTexto(item.horario ?? "");

    return (
      codigoCurso.includes(termino) ||
      asignatura.includes(termino) ||
      modulo.includes(termino) ||
      horario.includes(termino)
    );

  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Control de asistencia
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Consulta y administra las marcaciones de asistencia por docente,
          curso y fecha.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            Filtros de consulta
          </h2>
          <span className="text-xs text-slate-400">ASISTENCIA</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="docente"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Docente
            </label>
            <select
              id="docente"
              value={docente}
              onChange={(event) => setDocente(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Seleccione un docente</option>
              {docentes.map((item) => (
                <option key={item.codigo} value={item.codigo}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label
              htmlFor="curso"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Curso / operación
            </label>

            <input
              id="curso"
              type="text"
              value={busquedaCurso}
              onChange={(event) => {
                setBusquedaCurso(event.target.value);
                setCurso("");
                setMostrarResultadosCurso(true);
              }}
              onFocus={() => setMostrarResultadosCurso(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setMostrarResultadosCurso(false);
                }

                if (event.key === "Enter" && cursosFiltrados.length > 0) {
                  event.preventDefault();

                  const item = cursosFiltrados[0];
                  setCurso(item.codigo);
                  setBusquedaCurso(
                    `${item.codigo} — ${item.asignatura} — ${item.modulo}`
                  );
                  setMostrarResultadosCurso(false);
                }
              }}
              placeholder={
                cargandoCursos
                  ? "Cargando cursos..."
                  : !docente
                    ? "Selecciona un docente primero"
                    : cursos.length === 0
                      ? "No hay cursos disponibles"
                      : "Buscar por código, asignatura o módulo..."
              }
              disabled={!docente || cargandoCursos || cursos.length === 0}
              autoComplete="off"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />

            {mostrarResultadosCurso && docente && !cargandoCursos && cursos.length > 0 && (
              <div className="absolute z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="sticky top-0 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  {cursosFiltrados.length} de {cursos.length} cursos encontrados
                </div>

                {cursosFiltrados.length > 0 ? (
                  cursosFiltrados.map((item) => (
                    <button
                      key={item.codigo}
                      type="button"
                      onClick={() => {
                        setCurso(item.codigo);
                        setBusquedaCurso(
                          `${item.codigo} — ${item.asignatura} — ${item.modulo}`
                        );
                        setMostrarResultadosCurso(false);
                      }}
                      className={`block w-full border-b border-slate-100 px-3 py-3 text-left transition last:border-b-0 hover:bg-blue-50 ${
                        curso === item.codigo ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-slate-800">
                        {item.asignatura}
                      </span>

                      <span className="mt-1 block text-xs text-slate-600">
                        {item.modulo}
                      </span>

                      <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-400">
                        <span>Código: {item.codigo}</span>
                        <span>Horario: {item.horario}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-slate-500">
                    No se encontraron cursos con esa búsqueda.
                  </p>
                )}
              </div>
            )}

            {cursoSeleccionado && !mostrarResultadosCurso && (
              <p className="mt-1.5 text-xs text-green-700">
                Curso seleccionado: {cursoSeleccionado.codigo}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fecha"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Fecha de asistencia
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {mensaje && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {mensaje}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Registro de marcaciones
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {nombreDocente || "Sin docente seleccionado"}
              {cursoSeleccionado
                ? ` · ${cursoSeleccionado.codigo} · ${cursoSeleccionado.horario}`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {marcaciones.length} registros
            </span>
            <button
              type="button"
              disabled={!docente || !curso}
              onClick={() => {
                const parametros = new URLSearchParams({
                  docente,
                  curso,
                });
                window.open(
                  `/asistencia/reporte?${parametros.toString()}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver reporte
            </button>
          </div>
        </div>

        {cargandoMarcaciones ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            Consultando marcaciones...
          </div>
        ) : !docente || !curso ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">
              Selecciona un docente y un curso.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Los registros aparecerán después de completar los filtros.
            </p>
          </div>
        ) : marcaciones.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">
              No se encontraron marcaciones para esta fecha.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Puedes seleccionar otra fecha para consultar los registros.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Código</th>
                  <th className="px-5 py-3 font-semibold">Alumno</th>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Marcación</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marcaciones.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-500">
                      {item.id}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {item.alumno}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {item.fecha}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex min-w-12 justify-center rounded-md bg-blue-50 px-3 py-1 font-mono font-semibold text-blue-700">
                        {item.hora || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(item)}
                          disabled={procesando}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminar(item.id)}
                          disabled={procesando}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {marcacionEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-edicion"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5">
              <h2
                id="titulo-edicion"
                className="text-lg font-bold text-slate-800"
              >
                Editar marcación
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Modifica el valor registrado para el alumno.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Alumno
                </label>
                <input
                  value={marcacionEditando.alumno}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Fecha
                </label>
                <input
                  value={marcacionEditando.fecha}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                />
              </div>

              <div>
                <label
                  htmlFor="nueva-hora"
                  className="mb-1 block text-xs font-semibold uppercase text-slate-500"
                >
                  Marcación
                </label>
                <input
                  id="nueva-hora"
                  value={nuevaHora}
                  onChange={(event) => setNuevaHora(event.target.value)}
                  maxLength={8}
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej. 08:00 o J"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Puedes dejar el campo vacío si corresponde.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMarcacionEditando(null)}
                disabled={procesando}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarEdicion}
                disabled={procesando}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {procesando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
