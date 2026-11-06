import { getDocentesAsistencia } from "@/app/actions/asistencia";
import AsistenciaClient from "@/components/AsistenciaClient";


export default async function AsistenciaPage() {
  const docentes = await getDocentesAsistencia();

  return (
    <div className="p-6">
      <AsistenciaClient docentes={docentes} />
    </div>
  );
}
