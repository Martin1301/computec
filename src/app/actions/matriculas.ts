"use server"

import { prisma } from "@/lib/db"
import { connection } from "next/server"

// 1. CONTROLADOR DE CABECERAS (Tu código perfecto)
export async function getMatriculasGlobales() {
  await connection() 

  try {
    const matriculas = await prisma.mATRICULA_C.findMany({
      select: {
        COD_MATRICULA: true,
        CODALUMNO: true,
        ESTADO: true
      }
    })
    return matriculas
  } catch (error) {
    console.error("Error al leer cabeceras de matrícula en SQL Server:", error)
    return []
  }
}

// 2. CONTROLADOR DE DETALLES (Agregado debajo con sus 5 columnas reales)
export async function getDetalleCursosMatriculados() {
  await connection() 

  try {
    const detalles = await prisma.mATRICULA_D.findMany({
      select: {
        ID_CURSO: true,
        COD_DOCENTE: true,
        F_DESDE: true,
        F_HASTA: true,
        COD_ESTADO: true
      }
    })
    return detalles
  } catch (error) {
    console.error("Error al leer detalles de matrícula en SQL Server:", error)
    return []
  }
}
