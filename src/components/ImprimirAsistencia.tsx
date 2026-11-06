"use client";

export default function ImprimirAsistencia() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 print:hidden"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
