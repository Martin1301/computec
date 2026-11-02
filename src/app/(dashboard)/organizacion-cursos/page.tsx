import {
  getCatalogosOrganizacion,
  getOrganizacionCursos,
} from "@/app/actions/organizacion-cursos";
import OrganizacionCursosClient from "@/components/OrganizacionCursosClient";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    buscar?: string;
    resultado?: string;
    error?: string;
    aviso?: string;
  }>;
};

export default async function OrganizacionCursosPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const buscar = (params.buscar ?? "").trim();

  const [cursos, catalogos] = await Promise.all([
    getOrganizacionCursos(buscar),
    getCatalogosOrganizacion(),
  ]);

  return (
    <OrganizacionCursosClient
      cursos={cursos}
      carreras={catalogos.carreras}
      modulos={catalogos.modulos}
      asignaturas={catalogos.asignaturas}
      buscar={buscar}
      resultado={params.resultado}
      error={params.error}
      aviso={params.aviso}
    />
  );
}