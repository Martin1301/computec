"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type CarreraReporte = {
  codigo: string;
  nombre: string;
  estado: string | null;
};

async function exigirSesion() {
  const session = await getSession();

  if (!session) redirect("/");

  return session;
}

export async function getReporteCarreras(
  nombres = ""
): Promise<CarreraReporte[]> {
  await exigirSesion();

  const filtro = `%${nombres.trim()}%`;

  try {
    return await prisma.$queryRaw<CarreraReporte[]>`
      SELECT
        LTRIM(RTRIM(COD_CARRERA)) AS codigo,
        LTRIM(RTRIM(DES_CARRERA)) AS nombre,
        LTRIM(RTRIM(EST_CARRERA)) AS estado
      FROM dbo.T_CARRERA
      WHERE DES_CARRERA LIKE ${filtro}
      ORDER BY COD_CARRERA
    `;
  } catch (error) {
    console.error("Error al generar el reporte de carreras:", error);
    throw new Error("No se pudo obtener el reporte de carreras.");
  }
}
