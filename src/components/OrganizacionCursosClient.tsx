"use client";

import { useEffect, useState } from "react";
import {
  anularOrganizacionCurso,
  actualizarOrganizacionCurso,
  crearOrganizacionCurso,
  type CursoOrganizado,
  type OpcionCatalogo,
} from "@/app/actions/organizacion-cursos";

type Props = {
  aviso?: string;
  cursos: CursoOrganizado[];
  carreras: OpcionCatalogo[];
  modulos: OpcionCatalogo[];
  asignaturas: OpcionCatalogo[];
  buscar: string;
  resultado?: string;
  error?: string;
};

const inputClass =
  "mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "block text-sm font-semibold text-slate-700";

const mensajes: Record<string, string> = {
  creado: "Organización registrada correctamente.",
  actualizado: "Organización actualizada correctamente.",
  anulado: "Organización eliminada correctamente.",
};

const errores: Record<string, string> = {
  campos_obligatorios: "Completa todos los campos obligatorios.",
  orden_invalido: "El orden debe ser un número entero entre 0 y 99.",
  codigo_invalido: "El código indicado no es válido.",
  no_se_pudo_crear: "No se pudo registrar la organización.",
  no_se_pudo_actualizar: "No se pudo actualizar la organización.",
  no_se_pudo_anular: "No se pudo anular el registro.",

  "ERROR!!!, NO SE GRABARON LOS DATOS":
    "No se pudieron guardar los datos. Verifica los datos ingresados.",

  "ERROR, EL REGISTRO TIENE MOVIMIENTOS NO SE PUEDE ELIMINAR":
    "No se puede eliminar este curso porque tiene movimientos relacionados.",
};

function Selector({
  name,
  label,
  opciones,
  defaultValue,
}: {
  name: string;
  label: string;
  opciones: OpcionCatalogo[];
  defaultValue?: string;
}) {
  return (
    <label className={labelClass}>
      {label} *
      <select
        name={name}
        required
        defaultValue={defaultValue ?? ""}
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

export default function OrganizacionCursosClient({
  cursos,
  carreras,
  modulos,
  asignaturas,
  buscar,
  resultado,
  error,
  aviso,
}: Props) {

  const [mostrarMensaje, setMostrarMensaje] = useState(
    Boolean(resultado || error)
  );

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setMostrarMensaje(Boolean(resultado || error));
    setGuardando(false);
  }, [aviso, resultado, error]);

  return (
    <section
        className="min-w-0 w-full space-y-6"
        onChangeCapture={() => setMostrarMensaje(false)}
      >
      {/* Encabezado */}
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Mantenimiento académico
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Organizar cursos
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Relaciona carreras, módulos y asignaturas, y establece el orden
          académico de cada curso.
        </p>
      </header>

      {/* Mensajes */}
      {mostrarMensaje && resultado && mensajes[resultado] && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {mensajes[resultado]}
        </div>
      )}

      {mostrarMensaje && error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {errores[error] ?? "Ocurrió un error al procesar la solicitud."}
        </div>
      )}

      {/* Formulario de nueva organización */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Nueva organización
        </h2>

        {carreras.length === 0 ||
        modulos.length === 0 ||
        asignaturas.length === 0 ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Para registrar cursos, debe existir al menos una carrera, un
            módulo y una asignatura activos. Primero revisa las pantallas de
            mantenimiento correspondientes.
          </p>
        ) : (
          <form
            action={crearOrganizacionCurso}
            onSubmitCapture={() => setGuardando(true)}
            className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <Selector
              name="carrera"
              label="Carrera"
              opciones={carreras}
            />

            <Selector
              name="modulo"
              label="Módulo"
              opciones={modulos}
            />

            <Selector
              name="asignatura"
              label="Asignatura"
              opciones={asignaturas}
            />

            <label className={labelClass}>
              Orden *
              <input
                name="orden"
                type="number"
                min={0}
                max={99}
                required
                defaultValue={1}
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

            <div className="flex items-end">
              <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              {guardando ? "Guardando..." : "Registrar organización"}
            </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabla de organizaciones */}
      <div className="min-w-0 w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Encabezado y búsqueda */}
        <div className="flex min-w-0 flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900">
              Organizaciones registradas
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {cursos.length} resultado(s)
            </p>
          </div>

          <form
            action="/organizacion-cursos"
            method="get"
            className="flex min-w-0 gap-2"
          >
            <input
              name="buscar"
              defaultValue={buscar}
              placeholder="Buscar por asignatura"
              aria-label="Buscar organizaciones"
              className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 md:w-80"
            />

            <button
              type="submit"
              className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Desplazamiento horizontal independiente */}
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-[1150px] min-w-[1150px] table-fixed border-collapse divide-y divide-slate-200">
            <colgroup>
                <col style={{ width: "90px" }} />
                <col style={{ width: "230px" }} />
                <col style={{ width: "200px" }} />
                <col style={{ width: "250px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "150px" }} />
            </colgroup>

            <thead className="bg-slate-50">
              <tr>
                {[
                  "Código",
                  "Carrera",
                  "Módulo",
                  "Asignatura",
                  "Orden",
                  "Estado",
                ].map((titulo) => (
                  <th
                    key={titulo}
                    className="whitespace-nowrap px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {titulo}
                  </th>
                ))}

                <th className="sticky right-0 z-20 w-[150px] whitespace-nowrap border-l border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Acciones
              </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {cursos.map((curso) => {
                const formId = `curso-${curso.codigo}`;

                return (
                  <tr
                    key={curso.codigo}
                    className="align-middle transition hover:bg-blue-50/40"
                  >
                    {/* Código */}
                    <td className="whitespace-nowrap px-3 py-3 text-center align-middle text-sm font-bold text-slate-700">
                      {curso.codigo}
                    </td>

                    {/* Formulario de actualización de esta fila */}
                    <td className="px-3 py-3 align-middle">
                      <form
                        id={formId}
                        action={actualizarOrganizacionCurso}
                        onSubmitCapture={() => setGuardando(true)}
                      >
                        <input
                          type="hidden"
                          name="codigo"
                          value={curso.codigo}
                        />
                      </form>

                      <select
                        form={formId}
                        name="carrera"
                        defaultValue={curso.codCarrera}
                        aria-label={`Carrera del curso ${curso.codigo}`}
                        className="block w-full max-w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                      >
                        {carreras.map((opcion) => (
                          <option
                            key={opcion.codigo}
                            value={opcion.codigo}
                          >
                            {opcion.nombre}
                          </option>
                        ))}

                        {!carreras.some(
                          (opcion) =>
                            opcion.codigo === curso.codCarrera
                        ) && (
                          <option value={curso.codCarrera}>
                            {curso.carrera}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* Módulo */}
                    <td className="px-3 py-3 align-middle">
                      <select
                        form={formId}
                        name="modulo"
                        defaultValue={curso.codModulo}
                        aria-label={`Módulo del curso ${curso.codigo}`}
                        className="block w-full max-w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                      >
                        {modulos.map((opcion) => (
                          <option
                            key={opcion.codigo}
                            value={opcion.codigo}
                          >
                            {opcion.nombre}
                          </option>
                        ))}

                        {!modulos.some(
                          (opcion) =>
                            opcion.codigo === curso.codModulo
                        ) && (
                          <option value={curso.codModulo}>
                            {curso.modulo}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* Asignatura */}
                    <td className="px-3 py-3 align-middle">
                      <select
                        form={formId}
                        name="asignatura"
                        defaultValue={curso.codAsignatura}
                        aria-label={`Asignatura del curso ${curso.codigo}`}
                        className="block w-full max-w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                      >
                        {asignaturas.map((opcion) => (
                          <option
                            key={opcion.codigo}
                            value={opcion.codigo}
                          >
                            {opcion.nombre}
                          </option>
                        ))}

                        {!asignaturas.some(
                          (opcion) =>
                            opcion.codigo === curso.codAsignatura
                        ) && (
                          <option value={curso.codAsignatura}>
                            {curso.asignatura}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* Orden */}
                    <td className="px-3 py-3 text-center align-middle">
                      <input
                        form={formId}
                        name="orden"
                        type="number"
                        min={0}
                        max={99}
                        required
                        defaultValue={curso.orden}
                        aria-label={`Orden del curso ${curso.codigo}`}
                        className="w-16 max-w-full rounded-md border border-slate-200 px-2 py-2 text-center text-sm text-slate-800"
                      />
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-3 text-center align-middle">
                      <select
                        form={formId}
                        name="estado"
                        defaultValue={curso.estado === "A" ? "A" : "I"}
                        aria-label={`Estado del curso ${curso.codigo}`}
                        className="w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                      >
                        <option value="A">Activo</option>
                        <option value="I">Inactivo</option>
                      </select>
                    </td>

                    {/* Acciones fijas a la derecha */}
                    <td className="sticky right-0 z-10 w-[150px] border-l border-slate-200 bg-white px-2 py-3 align-middle">
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                        form={formId}
                        type="submit"
                        disabled={guardando}
                        title="Guardar cambios"
                        aria-label={`Guardar cambios del curso ${curso.codigo}`}
                        className="rounded-md bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {guardando ? "Guardando..." : "Guardar"}
                      </button>

                        <form
                        action={anularOrganizacionCurso}
                        onSubmit={(event) => {
                            if (
                            !window.confirm(
                                `¿Deseas anular la organización ${curso.codigo}?`
                            )
                            ) {
                            event.preventDefault();
                            }
                        }}
                        >
                        <input type="hidden" name="codigo" value={curso.codigo} />

                        <button
                            type="submit"
                            title="Anular organización"
                            aria-label={`Anular organización ${curso.codigo}`}
                            className="rounded-md border border-rose-200 px-2 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                            Anular
                        </button>
                        </form>
                    </div>
                    </td>
                  </tr>
                );
              })}

              {cursos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No se encontraron organizaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          Si no ves todas las columnas, desplaza la tabla horizontalmente.
          La columna Acciones permanece fija a la derecha.
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        La anulación utiliza el procedimiento almacenado original. Los cambios
        deben validarse contra las reglas de negocio de SQL Server.
      </p>
    </section>
  );
}
