"use server";

import { prisma } from "@/lib/db";
import { connection } from "next/server";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type AlumnoInforme = {
  CODALUMNO: string;
  NOMBRECOMPLETO: string;
};

export async function getAlumnosActivosInforme(): Promise<AlumnoInforme[]> {
  await connection();

  const sesion = await getSession();

  if (!sesion) {
    redirect("/");
  }

  try {
    return await prisma.$queryRaw<AlumnoInforme[]>`
      SELECT
        LTRIM(RTRIM(CODALUMNO)) AS CODALUMNO,
        LTRIM(RTRIM(NOMBRECOMPLETO)) AS NOMBRECOMPLETO
      FROM dbo.V_ALUMNOS
      WHERE ESTADO = 'A'
      ORDER BY NOMBRECOMPLETO
    `;
  } catch (error) {
    console.error("Error al cargar alumnos para el informe:", error);
    throw new Error("No se pudo cargar la lista de alumnos activos.");
  }
}
