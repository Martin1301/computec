"use server"

import { prisma } from "@/lib/db"
import { connection } from "next/server"

// 1. Obtener el récord de notas real de un alumno específico
export async function getNotasByAlumno(codAlumno: string) {
  await connection() // Forzar ruta dinámica en Next.js 16+
  try {
    const notas = await prisma.nOTA_ALUMNO.findMany({
      where: { 
        CODALUMNO: codAlumno,
        ESTADO: "A" // Solo traer registros vigentes si aplica
      },
      select: {
        IDNOTA: true,
        IDOPERA: true, // Código de la operación/curso/matrícula relacionada
        A1: true,
        A2: true,
        A3: true,
        CE1: true,
        FINAL: true,   // Nota Final
        LOGRO: true,   // Nivel de logro obtenido
        OBSERVACION: true
      }
    })
    return notas
  } catch (error) {
    console.error("Error al consultar notas reales en SQL Server:", error)
    return []
  }
}
