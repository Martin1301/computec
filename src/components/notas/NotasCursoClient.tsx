"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  agregarAlumnoOperacion,
  buscarAlumnosParaNotas,
  eliminarNotaAlumno,
  guardarNotaAlumno,
  type AlumnoBusquedaNotas,
  type DetalleOperacionNotas,
} from "@/app/actions/notas-gestion";
import type { NotaAlumno } from "@/app/actions/notas";

type Props = {
  operacion: DetalleOperacionNotas;
  notasIniciales: NotaAlumno[];
};

type FormNotas = {
  A1: number | null;
  A2: number | null;
  A3: number | null;
  A4: number | null;
  A5: number | null;
  A6: number | null;
  C2: number | null;
  M2: number | null;
  FINAL: number | null;
  OBSERVACION: string;
};

const campos: (keyof Omit<FormNotas, "OBSERVACION">)[] = [
  "A1", "A2", "A3", "A4", "A5", "A6", "C2", "M2", "FINAL",
];

function fecha(valor: Date | string | null) {
  if (!valor) return "—";

  const texto = String(valor);
  const coincidencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (coincidencia) {
    const [, anio, mes, dia] = coincidencia;
    return `${dia}/${mes}/${anio}`;
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "—";

  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const anio = fecha.getUTCFullYear();

  return `${dia}/${mes}/${anio}`;
}

function formularioInicial(nota: NotaAlumno): FormNotas {
  return {
    A1: nota.A1,
    A2: nota.A2,
    A3: nota.A3,
    A4: nota.A4,
    A5: nota.A5,
    A6: nota.A6,
    C2: nota.C2,
    M2: nota.M2,
    FINAL: nota.FINAL,
    OBSERVACION: nota.OBSERVACION ?? "",
  };
}

export default function NotasCursoClient({
  operacion,
  notasIniciales,
}: Props) {
  const router = useRouter();

  const [notas, setNotas] = useState(notasIniciales);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState<AlumnoBusquedaNotas[]>([]);
  const [seleccionado, setSeleccionado] =
    useState<AlumnoBusquedaNotas | null>(null);
  const [notaEditar, setNotaEditar] = useState<NotaAlumno | null>(null);
  const [form, setForm] = useState<FormNotas>({
    A1: null, A2: null, A3: null,
    A4: null, A5: null, A6: null,
    C2: null, M2: null, FINAL: null,
    OBSERVACION: "",
  });

  const [procesando, setProcesando] = useState(false);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setNotas(notasIniciales);
  }, [notasIniciales]);

  useEffect(() => {
    if (!modalAgregar || busqueda.trim().length < 2) {
      setAlumnos([]);
      setCargandoBusqueda(false);
      return;
    }

    let cancelado = false;
    setCargandoBusqueda(true);

    const temporizador = setTimeout(async () => {
      try {
        const resultado = await buscarAlumnosParaNotas(busqueda);
        if (!cancelado) setAlumnos(resultado);
      } catch {
        if (!cancelado) setAlumnos([]);
      } finally {
        if (!cancelado) setCargandoBusqueda(false);
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [busqueda, modalAgregar]);

  function abrirEdicion(nota: NotaAlumno) {
    setNotaEditar(nota);
    setForm(formularioInicial(nota));
    setError("");
    setMensaje("");
    setModalEditar(true);
  }

  async function agregarAlumno() {
    if (!seleccionado) {
      setError("Selecciona un alumno.");
      return;
    }

    setProcesando(true);
    setError("");

    try {
      const resultado = await agregarAlumnoOperacion(
        operacion.IDOPERA,
        seleccionado.codigo
      );

      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }

      setModalAgregar(false);
      setBusqueda("");
      setAlumnos([]);
      setSeleccionado(null);
      setMensaje(resultado.mensaje);
      router.refresh();
    } catch {
      setError("No se pudo agregar al alumno.");
    } finally {
      setProcesando(false);
    }
  }

  async function guardarCambios() {
    if (!notaEditar) return;

    setProcesando(true);
    setError("");

    try {
      const resultado = await guardarNotaAlumno({
        idNota: notaEditar.IDNOTA,
        ...form,
      });

      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }

      setModalEditar(false);
      setNotaEditar(null);
      setMensaje(resultado.mensaje);
      router.refresh();
    } catch {
      setError("No se pudieron guardar las calificaciones.");
    } finally {
      setProcesando(false);
    }
  }

  async function retirarAlumno(nota: NotaAlumno) {
    const confirmar = window.confirm(
      `¿Retirar a ${nota.ALUMNO} de esta operación? También se eliminarán sus marcaciones asociadas.`
    );

    if (!confirmar) return;

    setProcesando(true);
    setError("");

    try {
      const resultado = await eliminarNotaAlumno(nota.IDNOTA);

      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }

      setNotas((actuales) =>
        actuales.filter((item) => item.IDNOTA !== nota.IDNOTA)
      );
      setMensaje(resultado.mensaje);
      router.refresh();
    } catch {
      setError("No se pudo eliminar el registro.");
    } finally {
      setProcesando(false);
    }
  }

  function cambiarNota(campo: keyof Omit<FormNotas, "OBSERVACION">, valor: string) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor === "" ? null : Number(valor),
    }));
  }

  return (
    <div className="space-y-5">

      {/* Información de la operación */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-blue-700">
          Operación {operacion.IDOPERA}
        </p>

        <h2 className="mt-1 text-xl font-semibold text-gray-900">
          {operacion.DES_ASIGNATURA || "Asignatura"}
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          {operacion.DES_MODULO || "Sin módulo"} ·{" "}
          {operacion.DES_CARRERA || "Sin carrera"}
        </p>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-gray-500">Docente</p>
            <p className="font-medium text-gray-900">{operacion.NOM_DOCENTE}</p>
          </div>
          <div>
            <p className="text-gray-500">Horario</p>
            <p className="font-medium text-gray-900">{operacion.DESHORARIO || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Desde</p>
            <p className="font-medium text-gray-900">{fecha(operacion.DESDE)}</p>
          </div>
          <div>
            <p className="text-gray-500">Hasta</p>
            <p className="font-medium text-gray-900">{fecha(operacion.HASTA)}</p>
          </div>
        </div>
      </section>

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {mensaje}
        </div>
      )}

      {error && !modalAgregar && !modalEditar && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabla de calificaciones */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-gray-900">
              Alumnos y calificaciones
            </h3>
            <p className="text-sm text-gray-500">
              {notas.length} alumnos registrados
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMensaje("");
              setModalAgregar(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Agregar alumno
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1450px] w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left">
                  Alumno
                </th>
                {[
                  "A1", "A2", "A3", "CE1", "A4", "A5", "A6",
                  "C2", "M2", "FINAL", "CE2", "LOGRO", "Faltas",
                ].map((campo) => (
                  <th key={campo} className="px-3 py-3 text-center">
                    {campo}
                  </th>
                ))}
                <th className="px-4 py-3 text-left">Observación</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {notas.map((nota) => (
                <tr key={nota.IDNOTA} className="hover:bg-blue-50/40">
                  <td className="sticky left-0 min-w-[240px] bg-white px-4 py-3">
                    <p className="font-medium text-gray-900">{nota.ALUMNO}</p>
                    <p className="text-xs text-gray-500">{nota.CODALUMNO}</p>
                  </td>

                  {[
                    nota.A1, nota.A2, nota.A3, nota.CE1,
                    nota.A4, nota.A5, nota.A6, nota.C2,
                    nota.M2, nota.FINAL, nota.CE2,
                    nota.LOGRO, nota.FALTA,
                  ].map((valor, indice) => (
                    <td key={indice} className="px-3 py-3 text-center text-gray-700">
                      {valor ?? "—"}
                    </td>
                  ))}

                  <td className="max-w-[220px] px-4 py-3 text-gray-600">
                    {nota.OBSERVACION || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEdicion(nota)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => retirarAlumno(nota)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Retirar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {notas.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-4 py-12 text-center text-gray-500">
                    No hay alumnos registrados en esta operación.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal agregar alumno */}
      {modalAgregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Agregar alumno
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Busca por nombres y apellidos.
            </p>

            <input
              autoFocus
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setSeleccionado(null);
              }}
              placeholder="Escribe al menos 2 caracteres..."
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200">
              {cargandoBusqueda && (
                <p className="p-4 text-sm text-gray-500">Buscando...</p>
              )}

              {!cargandoBusqueda && busqueda.trim().length >= 2 && alumnos.length === 0 && (
                <p className="p-4 text-sm text-gray-500">
                  No se encontraron alumnos activos.
                </p>
              )}

              {alumnos.map((alumno) => (
                <button
                  key={alumno.codigo}
                  type="button"
                  onClick={() => setSeleccionado(alumno)}
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-blue-50 ${
                    seleccionado?.codigo === alumno.codigo ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="block text-sm font-medium text-gray-900">
                    {alumno.nombre}
                  </span>
                  <span className="text-xs text-gray-500">
                    Código: {alumno.codigo}
                  </span>
                </button>
              ))}
            </div>

            {seleccionado && (
              <p className="mt-3 text-sm text-blue-700">
                Seleccionado: {seleccionado.nombre}
              </p>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={procesando}
                onClick={() => {
                  setModalAgregar(false);
                  setBusqueda("");
                  setAlumnos([]);
                  setSeleccionado(null);
                  setError("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={procesando || !seleccionado}
                onClick={agregarAlumno}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {procesando ? "Agregando..." : "Agregar alumno"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar calificaciones */}
      {modalEditar && notaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4">
          <div className="my-6 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar calificaciones
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {notaEditar.ALUMNO} · {notaEditar.CODALUMNO}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {campos.map((campo) => (
                <div key={campo}>
                  <label
                    htmlFor={`nota-${campo}`}
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {campo}
                  </label>
                  <input
                    id={`nota-${campo}`}
                    type="number"
                    min="0"
                    max="20"
                    step="1"
                    value={form[campo] ?? ""}
                    onChange={(e) => cambiarNota(campo, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>

            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              CE1, CE2 y LOGRO son calculados automáticamente por SQL Server.
            </p>

            <div className="mt-4">
              <label
                htmlFor="observacion"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Observación (máximo 50 caracteres)
              </label>
              <textarea
                id="observacion"
                rows={3}
                maxLength={50}
                value={form.OBSERVACION}
                onChange={(e) =>
                  setForm((actual) => ({
                    ...actual,
                    OBSERVACION: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-right text-xs text-gray-400">
                {form.OBSERVACION.length}/50
              </p>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={procesando}
                onClick={() => setModalEditar(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={procesando}
                onClick={guardarCambios}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {procesando ? "Guardando..." : "Guardar calificaciones"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
