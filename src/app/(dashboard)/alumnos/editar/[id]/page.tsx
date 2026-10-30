import { notFound } from "next/navigation"
import { getAlumnoByCodigo, updateAlumno } from "@/app/actions/alumnos"
import FormularioEditar from "./FormularioEditar"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarAlumnoPage({ params }: Props) {
  const { id } = await params
  const alumno = await getAlumnoByCodigo(id)

  // Si el código no existe en SQL Server, Next.js muestra una vista 404 controlada
  if (!alumno) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Editar Registro de Alumno</h1>
        <p className="text-sm text-slate-500">Código del estudiante: <span className="font-mono font-bold text-slate-700">{alumno.CODALUMNO}</span></p>
      </div>

      {/* Pasamos los datos obtenidos en el servidor al componente interactivo del formulario */}
      <FormularioEditar alumno={alumno} />
    </div>
  )
}
