import Link from "next/link";
import { notFound } from "next/navigation";

import { getDetalleOperacionNotas } from "@/app/actions/notas-gestion";
import { getNotasByOperacion } from "@/app/actions/notas";
import NotasCursoClient from "@/components/notas/NotasCursoClient";

type PageProps = {
  params: Promise<{ idOpera: string }>;
};

export default async function NotasCursoPage({ params }: PageProps) {
  const { idOpera } = await params;

  const [operacion, notas] = await Promise.all([
    getDetalleOperacionNotas(idOpera),
    getNotasByOperacion(idOpera),
  ]);

  if (!operacion) notFound();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/notas" className="transition hover:text-blue-600">
            Notas
          </Link>
          <span>/</span>
          <span className="font-medium text-blue-600">
            Gestión por curso
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Registro de calificaciones
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Consulta y administra las calificaciones de los alumnos de esta operación.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/notas/curso/${idOpera}/reporte`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800"
            >
              Imprimir reporte
            </Link>

            <Link
              href="/notas"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Volver a notas
            </Link>
          </div>
        </div>
      </div>

      <NotasCursoClient
        operacion={operacion}
        notasIniciales={notas}
      />
    </div>
  );
}
