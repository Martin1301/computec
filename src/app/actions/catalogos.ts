"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

type TipoCatalogo = "carreras" | "modulos" | "asignaturas"
type Registro = { codigo: string; nombre: string; estado: string }

const config = {
  carreras: { path: "/carreras", table: "T_CARRERA", code: "COD_CARRERA", name: "DES_CARRERA", status: "EST_CARRERA", maxCode: 2, maxName: 30, procedures: ["SP_CARRERA_NUEVO", "SP_CARRERA_MODIFICA", "SP_CARRERA_ANULA"] },
  modulos: { path: "/modulos", table: "T_MODULO", code: "COD_MODULO", name: "DES_MODULO", status: "EST_MODULO", maxCode: 2, maxName: 100, procedures: ["SP_MODULO_NUEVO", "SP_MODULO_MODIFICA", "SP_MODULO_ANULA"] },
  asignaturas: { path: "/asignaturas", table: "T_ASIGNATURA", code: "COD_ASIGNATURA", name: "DES_ASIGNATURA", status: "EST_ASIGNATURA", maxCode: 3, maxName: 100, procedures: ["SP_ASIGNATURA_NUEVO", "SP_ASIGNATURA_MODIFICA", "SP_ASIGNATURA_ANULA"] },
} as const

function getTipo(value: FormDataEntryValue | null): TipoCatalogo {
  if (value === "carreras" || value === "modulos" || value === "asignaturas") return value
  throw new Error("Tipo de catálogo no válido")
}

export async function getCatalogo(tipo: TipoCatalogo, buscar = ""): Promise<Registro[]> {
  const filtro = `%${buscar.trim()}%`
  try {
    let rows: unknown
    if (tipo === "carreras") {
      rows = await prisma.$queryRaw<Registro[]>`SELECT COD_CARRERA AS codigo, DES_CARRERA AS nombre, EST_CARRERA AS estado FROM dbo.T_CARRERA WHERE DES_CARRERA LIKE ${filtro} OR COD_CARRERA LIKE ${filtro} ORDER BY COD_CARRERA`
    } else if (tipo === "modulos") {
      rows = await prisma.$queryRaw<Registro[]>`SELECT COD_MODULO AS codigo, DES_MODULO AS nombre, EST_MODULO AS estado FROM dbo.T_MODULO WHERE DES_MODULO LIKE ${filtro} OR COD_MODULO LIKE ${filtro} ORDER BY COD_MODULO`
    } else {
      rows = await prisma.$queryRaw<Registro[]>`SELECT COD_ASIGNATURA AS codigo, DES_ASIGNATURA AS nombre, EST_ASIGNATURA AS estado FROM dbo.T_ASIGNATURA WHERE DES_ASIGNATURA LIKE ${filtro} OR COD_ASIGNATURA LIKE ${filtro} ORDER BY COD_ASIGNATURA`
    }
    return rows as Registro[]
  } catch (error) {
    console.error(`Error al listar ${tipo}:`, error)
    throw new Error(`No se pudo cargar el catálogo de ${tipo}. Verifica la conexión con SQL Server.`)
  }
}

export async function crearCatalogo(formData: FormData) {
  const tipo = getTipo(formData.get("tipo"))
  const nombre = String(formData.get("nombre") ?? "").trim()
  const estado = String(formData.get("estado") ?? "A")
  if (!nombre) throw new Error("El nombre es obligatorio")
  if (estado !== "A" && estado !== "I") throw new Error("Estado no válido")
  try {
    if (tipo === "carreras") await prisma.$executeRaw`EXEC dbo.SP_CARRERA_NUEVO ${nombre}, ${estado}`
    else if (tipo === "modulos") await prisma.$executeRaw`EXEC dbo.SP_MODULO_NUEVO ${nombre}, ${estado}`
    else await prisma.$executeRaw`EXEC dbo.SP_ASIGNATURA_NUEVO ${nombre}, ${estado}`
    revalidatePath(config[tipo].path)
  } catch (error) {
    console.error(`Error al crear ${tipo}:`, error)
    throw new Error(`No se pudo registrar. Verifica si el procedimiento almacenado correspondiente existe y revisa los datos ingresados.`)
  }
}

export async function actualizarCatalogo(formData: FormData) {
  const tipo = getTipo(formData.get("tipo"))
  const codigo = String(formData.get("codigo") ?? "").trim()
  const nombre = String(formData.get("nombre") ?? "").trim()
  const estado = String(formData.get("estado") ?? "A")
  if (!codigo || !nombre) throw new Error("El código y el nombre son obligatorios")
  if (estado !== "A" && estado !== "I") throw new Error("Estado no válido")
  try {
    if (tipo === "carreras") await prisma.$executeRaw`EXEC dbo.SP_CARRERA_MODIFICA ${codigo}, ${nombre}, ${estado}`
    else if (tipo === "modulos") await prisma.$executeRaw`EXEC dbo.SP_MODULO_MODIFICA ${codigo}, ${nombre}, ${estado}`
    else await prisma.$executeRaw`EXEC dbo.SP_ASIGNATURA_MODIFICA ${codigo}, ${nombre}, ${estado}`
    revalidatePath(config[tipo].path)
  } catch (error) {
    console.error(`Error al actualizar ${tipo}:`, error)
    throw new Error("No se pudieron guardar los cambios. Revisa la conexión y el procedimiento almacenado.")
  }
}

export async function eliminarCatalogo(formData: FormData) {
  const tipo = getTipo(formData.get("tipo"))
  const codigo = String(formData.get("codigo") ?? "").trim()
  if (!codigo) throw new Error("El código es obligatorio")
  try {
    if (tipo === "carreras") await prisma.$executeRaw`EXEC dbo.SP_CARRERA_ANULA ${codigo}`
    else if (tipo === "modulos") await prisma.$executeRaw`EXEC dbo.SP_MODULO_ANULA ${codigo}`
    else await prisma.$executeRaw`EXEC dbo.SP_ASIGNATURA_ANULA ${codigo}`
    revalidatePath(config[tipo].path)
  } catch (error) {
    console.error(`Error al anular ${tipo}:`, error)
    throw new Error("No se pudo anular el registro. Puede estar relacionado con cursos existentes.")
  }
}
