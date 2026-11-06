import Link from "next/link";
import { getAlumnosActivosInforme } from "@/app/actions/consultas";
import InformeCursosAlumnoClient from "@/components/consultas/InformeCursosAlumnoClient";

export const instant = false;

export default async function InformeCursosAlumnoPage() {
  const alumnos = await getAlumnosActivosInforme();

  return (
    <div className="space-y-5">
      <div className="no-imprimir">
        <Link
          href="/alumnos"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Volver a alumnos
        </Link>
      </div>

      <InformeCursosAlumnoClient alumnos={alumnos} />
    </div>
  );
}
