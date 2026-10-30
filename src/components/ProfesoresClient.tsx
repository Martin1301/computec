
"use client";

import { useState } from "react";
import {
  actualizarProfesor,
  anularProfesor,
  crearProfesor,
  type Profesor,
} from "@/app/actions/profesores";

const mensajes: Record<string, string> = {
  nombre_obligatorio: "Ingresa el nombre del docente.",
  nombre_largo: "El nombre no puede superar los 150 caracteres.",
  datos_obligatorios: "Completa el código y el nombre.",
  datos_invalidos: "Revisa el código y el nombre ingresados.",
  codigo_invalido: "El código del docente no es válido.",
  no_se_pudo_crear: "No se pudo registrar el docente. Revisa el procedimiento almacenado.",
  no_se_pudo_actualizar: "No se pudieron guardar los cambios.",
  no_se_pudo_anular: "No se pudo anular el docente. Verifica si está relacionado con otros registros.",
};

const resultados: Record<string, string> = {
  creado: "Docente registrado correctamente.",
  actualizado: "Docente actualizado correctamente.",
  anulado: "Docente anulado correctamente.",
};

export default function ProfesoresClient({
  profesores,
  buscar,
  resultado,
  error,
}: {
  profesores: Profesor[];
  buscar: string;
  resultado?: string;
  error?: string;
}) {
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mantenimiento de docentes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Registro, consulta, edición y anulación de docentes.
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          {profesores.length} resultados
        </span>
      </header>

      {resultado && resultados[resultado] && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {resultados[resultado]}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {mensajes[error] ?? "Ocurrió un error al procesar la operación."}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Registrar docente
        </h2>

        <form action={crearProfesor} className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="nombre-nuevo"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nombres y apellidos
            </label>
            <input
              id="nombre-nuevo"
              name="nombre"
              required
              maxLength={150}
              placeholder="Nombre completo del docente"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="estado-nuevo"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Estado
            </label>
            <select
              id="estado-nuevo"
              name="estado"
              defaultValue="A"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Registrar docente
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <form method="GET" className="flex flex-wrap gap-2">
          <input
            type="search"
            name="buscar"
            defaultValue={buscar}
            placeholder="Buscar por código o nombre..."
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Buscar
          </button>
          {buscar && (
            <a
              href="/profesores"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Limpiar
            </a>
          )}
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Docente
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {profesores.map((profesor) => {
                const activo =
                  profesor.EST_DOCENTE === "A" ||
                  profesor.EST_DOCENTE === "1";

                return (
                  <tr
                    key={profesor.COD_DOCENTE}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-semibold text-slate-700">
                      {profesor.COD_DOCENTE}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-800">
                      {editando === profesor.COD_DOCENTE ? (
                        <form
                          id={`editar-${profesor.COD_DOCENTE}`}
                          action={actualizarProfesor}
                          className="flex min-w-64 flex-col gap-2"
                        >
                          <input
                            type="hidden"
                            name="codigo"
                            value={profesor.COD_DOCENTE}
                          />
                          <input
                            name="nombre"
                            required
                            maxLength={150}
                            defaultValue={profesor.NOM_DOCENTE}
                            aria-label="Nombre del docente"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          />
                          <select
                            name="estado"
                            defaultValue={activo ? "A" : "I"}
                            aria-label="Estado del docente"
                            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="A">Activo</option>
                            <option value="I">Inactivo</option>
                          </select>
                        </form>
                      ) : (
                        profesor.NOM_DOCENTE
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          activo
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {editando === profesor.COD_DOCENTE ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="submit"
                            form={`editar-${profesor.COD_DOCENTE}`}
                            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditando(null)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditando(profesor.COD_DOCENTE)
                            }
                            className="rounded-md border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                          >
                            Editar
                          </button>

                          {activo && (
                            <form
                              action={anularProfesor}
                              onSubmit={(event) => {
                                if (
                                  !window.confirm(
                                    `¿Deseas anular al docente ${profesor.NOM_DOCENTE}?`
                                  )
                                ) {
                                  event.preventDefault();
                                }
                              }}
                            >
                              <input
                                type="hidden"
                                name="codigo"
                                value={profesor.COD_DOCENTE}
                              />
                              <button
                                type="submit"
                                className="rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                              >
                                Anular
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {profesores.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No se encontraron docentes para esta búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
