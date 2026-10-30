
import {
  getDocentesCurso,
  getOpcionesDocenteCurso,
} from "@/app/actions/docente-curso";
import DocenteCursoClient from "@/components/DocenteCursoClient";

type Props = {
  searchParams: Promise<{
    buscar?: string;
    pagina?: string;
    resultado?: string;
    error?: string;
  }>;
};

export default async function DocenteCursoPage({ searchParams }: Props) {
  const params = await searchParams;
  const buscar = (params.buscar ?? "").trim();
  const paginaSolicitada = Number.parseInt(params.pagina ?? "1", 10);
  const pagina = Number.isFinite(paginaSolicitada)
    ? Math.max(1, paginaSolicitada)
    : 1;

  const [resultadoLista, opciones] = await Promise.all([
  getDocentesCurso(buscar, pagina, 25),
  getOpcionesDocenteCurso(),
]);

const totalPaginas = Math.max(
  1,
  Math.ceil(resultadoLista.total / 25)
);

  return (
    <DocenteCursoClient
    asignaciones={resultadoLista.asignaciones}
    total={resultadoLista.total}
    paginaActual={resultadoLista.pagina}
    totalPaginas={totalPaginas}
    docentes={opciones.docentes}
    cursos={opciones.cursos}
    horarios={opciones.horarios}
    buscar={buscar}
    resultado={params.resultado}
    error={params.error}
    />
  );
}
