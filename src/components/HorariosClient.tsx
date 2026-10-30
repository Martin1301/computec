"use client";

import { useState } from "react";
import {
  actualizarHorario,
  anularHorario,
  crearHorario,
  type Horario,
  type Turno,
} from "@/app/actions/horarios";

type Props = {
  horarios: Horario[];
  turnos: Turno[];
  buscar: string;
  resultado?: string;
  error?: string;
};

const mensajesResultado: Record<string, string> = {
  creado: "Horario registrado correctamente.",
  actualizado: "Horario actualizado correctamente.",
  anulado: "Solicitud de anulación procesada.",
};

const mensajesError: Record<string, string> = {
  campos_obligatorios: "Completa todos los campos obligatorios.",
  datos_demasiado_largos: "Uno o más campos superan la longitud permitida.",
  codigo_invalido: "El código del horario no es válido.",
  no_se_pudo_crear: "No se pudo registrar el horario. Revisa los datos y el procedimiento almacenado.",
  no_se_pudo_actualizar: "No se pudo actualizar el horario.",
  no_se_pudo_anular: "No se pudo anular el horario. Puede estar relacionado con otros registros.",
};

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "block text-sm font-semibold text-slate-700";

export default function HorariosClient({
  horarios,
  turnos,
  buscar,
  resultado,
  error,
}: Props) {
  const [filtro, setFiltro] = useState(buscar);

  return (
    <section className="space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Mantenimiento académico
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Horarios
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Administra los horarios, turnos y descripciones utilizados en la
          organización académica.
        </p>
      </header>

      {resultado && mensajesResultado[resultado] && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {mensajesResultado[resultado]}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {mensajesError[error] ?? "Se produjo un error al procesar la solicitud."}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Registrar horario
        </h2>

        {turnos.length === 0 ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            No hay turnos activos disponibles. Revisa la tabla T_TURNO antes de
            registrar un horario.
          </p>
        ) : (
          <form
            action={crearHorario}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <label className={labelClass}>
              Nombre del horario *
              <input
                name="nombre"
                required
                maxLength={80}
                className={inputClass}
                placeholder="Ej. Mañana"
              />
            </label>

            <label className={labelClass}>
              Turno *
              <select name="turno" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Selecciona un turno
                </option>
                {turnos.map((turno) => (
                  <option key={turno.COD_TURNO} value={turno.COD_TURNO}>
                    {turno.DES_TURNO} ({turno.COD_TURNO})
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Sigla
              <input
                name="sigla"
                maxLength={7}
                className={inputClass}
                placeholder="Ej. MAN"
              />
            </label>

            <label className={`${labelClass} md:col-span-2`}>
              Descripción *
              <input
                name="descripcion"
                required
                maxLength={100}
                className={inputClass}
                placeholder="Descripción del horario"
              />
            </label>

            <label className={labelClass}>
              Estado
              <select name="estado" defaultValue="A" className={inputClass}>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Registrar horario
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Horarios registrados</h2>
            <p className="mt-1 text-xs text-slate-500">
              {horarios.length} resultado(s)
            </p>
          </div>

          <form
            action="/horarios"
            method="get"
            className="flex gap-2"
          >
            <input
              name="buscar"
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
              className="min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
              placeholder="Buscar horario..."
              aria-label="Buscar horario"
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Código", "Nombre", "Turno", "Descripción", "Sigla", "Estado", "Acciones"].map(
                  (titulo) => (
                    <th
                      key={titulo}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {titulo}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {horarios.map((horario) => {
                const formId = `editar-horario-${horario.COD_HORARIO}`;

                return (
                  <tr key={horario.COD_HORARIO} className="hover:bg-blue-50/40">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-700">
                      {horario.COD_HORARIO}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        form={formId}
                        name="nombre"
                        defaultValue={horario.DES_HORARIO}
                        required
                        maxLength={80}
                        aria-label={`Nombre ${horario.COD_HORARIO}`}
                        className="w-44 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-800"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <select
                        form={formId}
                        name="turno"
                        defaultValue={horario.COD_TURNO}
                        required
                        aria-label={`Turno ${horario.COD_HORARIO}`}
                        className="w-40 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
                      >
                        {turnos.map((turno) => (
                          <option key={turno.COD_TURNO} value={turno.COD_TURNO}>
                            {turno.DES_TURNO}
                          </option>
                        ))}
                        {!turnos.some((t) => t.COD_TURNO === horario.COD_TURNO) && (
                          <option value={horario.COD_TURNO}>
                            Turno actual ({horario.COD_TURNO})
                          </option>
                        )}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <input
                        form={formId}
                        name="descripcion"
                        defaultValue={horario.DESCRIPCION}
                        required
                        maxLength={100}
                        aria-label={`Descripción ${horario.COD_HORARIO}`}
                        className="w-56 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-800"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        form={formId}
                        name="sigla"
                        defaultValue={horario.SIGLA ?? ""}
                        maxLength={7}
                        aria-label={`Sigla ${horario.COD_HORARIO}`}
                        className="w-24 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-800"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <select
                        form={formId}
                        name="estado"
                        defaultValue={horario.ESTADO === "A" ? "A" : "I"}
                        aria-label={`Estado ${horario.COD_HORARIO}`}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
                      >
                        <option value="A">Activo</option>
                        <option value="I">Inactivo</option>
                      </select>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <form id={formId} action={actualizarHorario}>
                        <input type="hidden" name="codigo" value={horario.COD_HORARIO} />
                      </form>

                      <div className="flex items-center gap-2">
                        <button
                          form={formId}
                          type="submit"
                          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          Guardar
                        </button>

                        <form
                          action={anularHorario}
                          onSubmit={(event) => {
                            if (
                              !window.confirm(
                                `¿Deseas anular el horario ${horario.COD_HORARIO}?`
                              )
                            ) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input
                            type="hidden"
                            name="codigo"
                            value={horario.COD_HORARIO}
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                          >
                            Anular
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {horarios.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No se encontraron horarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        La opción Anular utiliza el procedimiento original del sistema. No
        elimina físicamente el registro.
      </p>
    </section>
  );
}