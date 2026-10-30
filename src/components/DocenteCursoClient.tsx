
"use client";

import {
  crearDocenteCurso,
  actualizarDocenteCurso,
  eliminarDocenteCurso,
  type DocenteCurso,
  type OpcionDocenteCurso,
} from "@/app/actions/docente-curso";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  asignaciones: DocenteCurso[];
  total: number;
  paginaActual: number;
  totalPaginas: number;
  docentes: OpcionDocenteCurso[];
  cursos: OpcionDocenteCurso[];
  horarios: OpcionDocenteCurso[];
  buscar: string;
  resultado?: string;
  error?: string;
};

const REGISTROS_POR_PAGINA = 25;

const inputClass =
  "mt-1 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "block min-w-0 text-sm font-semibold text-slate-700";

const cellTextClass =
  "block whitespace-normal break-words text-sm leading-5 text-slate-700";

const mensajes: Record<string, string> = {
  creado: "Asignación registrada correctamente.",
  actualizado: "Asignación actualizada correctamente.",
  eliminado: "Solicitud de eliminación procesada.",
};

const errores: Record<string, string> = {
  campos_obligatorios: "Completa todos los campos obligatorios.",
  fechas_invalidas:
    "La fecha Hasta debe ser igual o posterior a Desde.",
  estado_invalido: "El estado seleccionado no es válido.",
  codigo_invalido: "El código de asignación no es válido.",
  no_se_pudo_crear:
    "No se pudo registrar la asignación. Revisa los datos y el procedimiento almacenado.",
  no_se_pudo_actualizar:
    "No se pudo actualizar la asignación docente-curso.",
  no_se_pudo_eliminar:
    "No se pudo eliminar la asignación docente-curso.",
};

function Selector({
  name,
  label,
  opciones,
}: {
  name: string;
  label: string;
  opciones: OpcionDocenteCurso[];
}) {
  return (
    <label className={labelClass}>
      {label}
      <select
        name={name}
        required
        defaultValue=""
        className={inputClass}
      >
        <option value="" disabled>
          Selecciona una opción
        </option>

        {opciones.map((opcion) => (
          <option key={opcion.codigo} value={opcion.codigo}>
            {opcion.nombre} ({opcion.codigo})
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectorEdicion({
  name,
  label,
  opciones,
  valor,
}: {
  name: string;
  label: string;
  opciones: OpcionDocenteCurso[];
  valor: string;
}) {
  const existe = opciones.some(
    (opcion) => opcion.codigo === valor
  );

  return (
    <label className={labelClass}>
      {label}

      <select
        name={name}
        required
        defaultValue={existe ? valor : ""}
        className={inputClass}
      >
        <option value="" disabled>
          {existe
            ? "Selecciona una opción"
            : "No se identificó el valor actual"}
        </option>

        {opciones.map((opcion) => (
          <option key={opcion.codigo} value={opcion.codigo}>
            {opcion.nombre} ({opcion.codigo})
          </option>
        ))}
      </select>
    </label>
  );
}

function fechaParaInput(fecha: string) {
  if (!fecha) return "";

  const coincidencia = fecha.match(/^\d{4}-\d{2}-\d{2}/);

  return coincidencia ? coincidencia[0] : "";
}

export default function DocenteCursoClient({
  asignaciones,
  total,
  paginaActual,
  totalPaginas,
  docentes,
  cursos,
  horarios,
  buscar,
  resultado,
  error,
}: Props) {
  const router = useRouter();

  const [codigoEditando, setCodigoEditando] =
    useState<string | null>(null);

  // El servidor ya debe enviar solamente los registros de esta página.
  const asignacionesPagina = asignaciones;

  const primeraFila =
    total === 0
      ? 0
      : (paginaActual - 1) * REGISTROS_POR_PAGINA + 1;

  const ultimaFila = Math.min(
    paginaActual * REGISTROS_POR_PAGINA,
    total
  );

  function irPagina(pagina: number) {
    const paginaDestino = Math.max(
      1,
      Math.min(totalPaginas, pagina)
    );

    const params = new URLSearchParams();

    if (buscar.trim()) {
      params.set("buscar", buscar.trim());
    }

    params.set("pagina", String(paginaDestino));

    setCodigoEditando(null);

    router.push(`/docente-curso?${params.toString()}`);
  }

  return (
    <section className="w-full min-w-0 space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Gestión académica
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Asignación docente–curso
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Asigna docentes a cursos y define sus horarios y periodo académico.
        </p>
      </header>

      {resultado && mensajes[resultado] && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {mensajes[resultado]}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {errores[error] ??
            "Ocurrió un error al procesar la operación."}
        </div>
      )}

      {/* Crear asignación */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Nueva asignación
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos para registrar una asignación.
          </p>
        </div>

        {docentes.length === 0 ||
        cursos.length === 0 ||
        horarios.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Para registrar una asignación deben existir docentes activos,
            cursos y horarios. Revisa los mantenimientos correspondientes.
          </p>
        ) : (
          <form
            action={crearDocenteCurso}
            className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <Selector
              name="docente"
              label="Docente *"
              opciones={docentes}
            />

            <Selector
              name="curso"
              label="Curso *"
              opciones={cursos}
            />

            <Selector
              name="horario"
              label="Horario *"
              opciones={horarios}
            />

            <label className={labelClass}>
              Desde *
              <input
                name="desde"
                type="date"
                required
                defaultValue={new Date()
                  .toISOString()
                  .slice(0, 10)}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Hasta *
              <input
                name="hasta"
                type="date"
                required
                defaultValue={new Date()
                  .toISOString()
                  .slice(0, 10)}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Estado
              <select
                name="estado"
                defaultValue="A"
                className={inputClass}
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </label>

            <div className="flex items-center sm:col-span-2 xl:col-span-3">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                Registrar asignación
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Listado de asignaciones */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-0 flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900">
              Asignaciones registradas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {total} registro(s) encontrados
            </p>
          </div>

          <form
            action="/docente-curso"
            method="get"
            className="flex w-full min-w-0 gap-2 lg:max-w-md"
          >
            <input
              name="buscar"
              defaultValue={buscar}
              placeholder="Buscar por docente, curso o código..."
              aria-label="Buscar asignaciones"
              className="block w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Buscar
            </button>

            {buscar.trim() !== "" && (
              <a
                href="/docente-curso"
                className="shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Limpiar
              </a>
            )}
          </form>
        </div>

        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[1550px] table-fixed border-collapse">
            <colgroup>
              <col style={{ width: "90px" }} />
              <col style={{ width: "190px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "210px" }} />
              <col style={{ width: "200px" }} />
              <col style={{ width: "190px" }} />
              <col style={{ width: "115px" }} />
              <col style={{ width: "115px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "180px" }} />
            </colgroup>

            <thead className="bg-slate-50">
              <tr>
                {[
                  "Código",
                  "Carrera",
                  "Módulo",
                  "Asignatura",
                  "Docente",
                  "Horario",
                  "Desde",
                  "Hasta",
                  "Estado",
                  "Acciones",
                ].map((titulo) => (
                  <th
                    key={titulo}
                    scope="col"
                    className="border-b border-slate-200 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {asignacionesPagina.map((asignacion) => {
                const editando =
                  codigoEditando === asignacion.codigo;

                const formId = `asignacion-${asignacion.codigo}`;

                const codigoDocente =
                  docentes.find(
                    (docente) =>
                      docente.nombre === asignacion.docente
                  )?.codigo ?? "";

                const codigoHorario =
                  horarios.find(
                    (horario) =>
                      asignacion.horario === horario.nombre ||
                      asignacion.horario.startsWith(
                        `${horario.nombre} `
                      )
                  )?.codigo ?? "";

                const cursoExiste = cursos.some(
                  (curso) =>
                    curso.codigo === asignacion.idCurso
                );

                return (
                  <tr
                    key={asignacion.codigo}
                    className="align-top transition-colors hover:bg-blue-50/50"
                  >
                    <td className="break-words px-3 py-3 text-center text-sm font-bold text-slate-700">
                      {asignacion.codigo}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={cellTextClass}
                        title={asignacion.carrera}
                      >
                        {asignacion.carrera || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={cellTextClass}
                        title={asignacion.modulo}
                      >
                        {asignacion.modulo || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={cellTextClass}
                        title={asignacion.asignatura}
                      >
                        {asignacion.asignatura || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={cellTextClass}
                        title={asignacion.docente}
                      >
                        {asignacion.docente || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={cellTextClass}
                        title={asignacion.horario}
                      >
                        {asignacion.horario || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-sm text-slate-700">
                      {fechaParaInput(asignacion.desde) || "—"}
                    </td>

                    <td className="px-3 py-3 text-sm text-slate-700">
                      {fechaParaInput(asignacion.hasta) || "—"}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          asignacion.estado === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {asignacion.estado === "A"
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-2 py-3">
                      {editando ? (
                        <form
                          id={formId}
                          action={actualizarDocenteCurso}
                          className="flex min-w-0 flex-col gap-3"
                        >
                          <input
                            type="hidden"
                            name="codigo"
                            value={asignacion.codigo}
                          />

                          <SelectorEdicion
                            name="docente"
                            label="Docente"
                            opciones={docentes}
                            valor={codigoDocente}
                          />

                          <SelectorEdicion
                            name="curso"
                            label="Curso"
                            opciones={cursos}
                            valor={asignacion.idCurso}
                          />

                          <label className={labelClass}>
                            Horario
                            <select
                              name="horario"
                              required
                              defaultValue={codigoHorario}
                              className={inputClass}
                            >
                              <option value="" disabled>
                                Selecciona horario
                              </option>

                              {horarios.map((opcion) => (
                                <option
                                  key={opcion.codigo}
                                  value={opcion.codigo}
                                >
                                  {opcion.nombre} ({opcion.codigo})
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className={labelClass}>
                            Desde
                            <input
                              name="desde"
                              type="date"
                              required
                              defaultValue={fechaParaInput(
                                asignacion.desde
                              )}
                              className={inputClass}
                            />
                          </label>

                          <label className={labelClass}>
                            Hasta
                            <input
                              name="hasta"
                              type="date"
                              required
                              defaultValue={fechaParaInput(
                                asignacion.hasta
                              )}
                              className={inputClass}
                            />
                          </label>

                          <label className={labelClass}>
                            Estado
                            <select
                              name="estado"
                              required
                              defaultValue={
                                asignacion.estado === "A" ? "A" : "I"
                              }
                              className={inputClass}
                            >
                              <option value="A">Activo</option>
                              <option value="I">Inactivo</option>
                            </select>
                          </label>

                          {!cursoExiste && (
                            <p className="text-xs leading-5 text-amber-700">
                              El curso actual no figura en el catálogo.
                              Selecciona un curso válido antes de guardar.
                            </p>
                          )}

                          <button
                            type="submit"
                            className="w-full rounded-md bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                          >
                            Guardar cambios
                          </button>

                          <button
                            type="button"
                            onClick={() => setCodigoEditando(null)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancelar edición
                          </button>
                        </form>
                      ) : (
                        <div className="flex min-w-0 flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCodigoEditando(asignacion.codigo)
                            }
                            className="w-full rounded-md bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                          >
                            Editar
                          </button>

                          <form
                            action={eliminarDocenteCurso}
                            onSubmit={(event) => {
                              if (
                                !window.confirm(
                                  `¿Deseas eliminar la asignación ${asignacion.codigo}?`
                                )
                              ) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <input
                              type="hidden"
                              name="codigo"
                              value={asignacion.codigo}
                            />

                            <button
                              type="submit"
                              className="w-full rounded-md border border-rose-200 bg-white px-3 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              Eliminar
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {asignacionesPagina.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No se encontraron asignaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Mostrando {primeraFila}–{ultimaFila} de {total} registros
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={paginaActual <= 1}
              onClick={() => irPagina(paginaActual - 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <span className="whitespace-nowrap text-sm text-slate-600">
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              type="button"
              disabled={paginaActual >= totalPaginas}
              onClick={() => irPagina(paginaActual + 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
