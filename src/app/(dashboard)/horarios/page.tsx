import { getHorarios, getTurnos } from "@/app/actions/horarios";
import HorariosClient from "@/components/HorariosClient";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    buscar?: string;
    resultado?: string;
    error?: string;
    aviso?: string;
  }>;
};

export default async function HorariosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const buscar = (params.buscar ?? "").trim();

  const [horarios, turnos] = await Promise.all([
    getHorarios(buscar),
    getTurnos(),
  ]);

  return (
    <HorariosClient
      horarios={horarios}
      turnos={turnos}
      buscar={buscar}
      resultado={params.resultado}
      error={params.error}
      aviso={params.aviso}
    />
  );
}