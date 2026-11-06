
import { redirect, notFound } from "next/navigation";

import { getDetalleOperacionNotas } from "@/app/actions/notas-gestion";
import { getNotasByOperacion } from "@/app/actions/notas";
import { getSession } from "@/lib/session";
import ImprimirReporteNotasCurso from "./ImprimirReporteNotasCurso";

export const instant = false;

type PageProps = {
  params: Promise<{ idOpera: string }>;
};

export default async function ReporteNotasCursoPage({
  params,
}: PageProps) {
  // Mantener protegida la vista aunque esté fuera del dashboard.
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { idOpera } = await params;

  const [operacion, notas] = await Promise.all([
    getDetalleOperacionNotas(idOpera),
    getNotasByOperacion(idOpera),
  ]);

  if (!operacion) {
    notFound();
  }

  return (
    <ImprimirReporteNotasCurso
      operacion={operacion}
      notas={notas}
    />
  );
}
