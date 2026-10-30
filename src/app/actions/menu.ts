"use server"

import { prisma } from "@/lib/db"
import { connection } from "next/server"

export async function getMenuEstructural() {
  await connection() // Forzar renderizado dinámico en Next.js v16

  try {
    // 1. Traemos las categorías de menú principales
    const menusPrincipales = await prisma.mENU.findMany({
      orderBy: { cod_menu: "asc" }
    })
    
    // 2. Traemos SOLO los submódulos vinculados a Alumnos, Matrículas y Calificaciones (Notas)
    const subMenus = await prisma.mENU_SUB.findMany({
      where: {
        OR: [
          { des_submenu: { contains: "ALUMNO" } },
          { des_submenu: { contains: "MATRICULA" } },
          { des_submenu: { contains: "NOTA" } },
          { des_submenu: { contains: "CALIFICACION" } },
          { des_submenu: { contains: "CARRERA" } },
          { des_submenu: { contains: "MODULO" } },
          { des_submenu: { contains: "ASIGNATURA" } }
        ]
      },
      orderBy: { cod_submenu: "asc" }
    })

    // 3. Unimos las estructuras omitiendo las categorías que se hayan quedado vacías
    const menuCompleto = menusPrincipales
      .map(menu => ({
        ...menu,
        submodulos: subMenus.filter(sub => sub.cod_menu === menu.cod_menu)
      }))
      .filter(menu => menu.submodulos.length > 0) // Si un menú no tiene subcomponentes de notas/alumnos, se oculta

    return menuCompleto
  } catch (error) {
    console.error("Error al filtrar el menú académico de SQL Server:", error)
    return []
  }
}
