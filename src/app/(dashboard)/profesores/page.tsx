import { getProfesoresGlobales } from "@/app/actions/profesores";
import ProfesoresClient from "@/components/ProfesoresClient";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    buscar?: string;
    resultado?: string;
    error?: string;
  }>;
};

export default async function ProfesoresPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const buscar = (params.buscar ?? "").trim();

  const profesores = await getProfesoresGlobales(buscar);

  return (
    <ProfesoresClient
      profesores={profesores}
      buscar={buscar}
      resultado={params.resultado}
      error={params.error}
    />
  );
}
