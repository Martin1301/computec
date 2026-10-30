"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const PATH = "/organizacion-cursos";

export type CursoOrganizado = {
  codigo: string;
  codCarrera: string;
  carrera: string;
  codModulo: string;
  modulo: string;
  codAsignatura: string;
  asignatura: string;
  orden: number;
  estado: string;
};

export type OpcionCatalogo = {
  codigo: string;
  nombre: string;
};

async function exigirSesion() {
  const session = await getSession();
  if (!session) redirect("/");
}

function errorFormulario(codigo: string): never {
  redirect(`${PATH}?error=${encodeURIComponent(codigo)}`);
}

function esRedireccion(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error
  );
}

function validarEstado(estado: string) {
  if (estado !== "A" && estado !== "I") {
    throw new Error("Estado inválido");
  }
}

export async function getOrganizacionCursos(
  buscar = ""
): Promise<CursoOrganizado[]> {
  await exigirSesion();

  try {
    const filas = await prisma.$queryRaw<
      {
        IDCURSO: string;
        COD_CARRERA: string;
        DES_CARRERA: string;
        COD_MODULO: string;
        DES_MODULO: string;
        COD_ASIGNATURA: string;
        DES_ASIGNATURA: string;
        ORDEN: number;
        ESTADO: string;
      }[]
    >`
      EXEC dbo.SP_CURSOS_LISTA ${buscar.trim()}
    `;

    return filas.map((fila) => ({
      codigo: String(fila.IDCURSO).trim(),
      codCarrera: String(fila.COD_CARRERA).trim(),
      carrera: String(fila.DES_CARRERA).trim(),
      codModulo: String(fila.COD_MODULO).trim(),
      modulo: String(fila.DES_MODULO).trim(),
      codAsignatura: String(fila.COD_ASIGNATURA).trim(),
      asignatura: String(fila.DES_ASIGNATURA).trim(),
      orden: Number(fila.ORDEN),
      estado: String(fila.ESTADO).trim(),
    }));
  } catch (error) {
    console.error("Error al consultar la organización de cursos:", error);
    throw new Error(
      "No se pudo cargar la organización de cursos. Verifica SP_CURSOS_LISTA."
    );
  }
}

export async function getCatalogosOrganizacion() {
  await exigirSesion();

  const [carreras, modulos, asignaturas] = await Promise.all([
    prisma.t_CARRERA.findMany({
      where: { EST_CARRERA: "A" },
      select: {
        COD_CARRERA: true,
        DES_CARRERA: true,
      },
      orderBy: { DES_CARRERA: "asc" },
    }),
    prisma.t_MODULO.findMany({
      where: { EST_MODULO: "A" },
      select: {
        COD_MODULO: true,
        DES_MODULO: true,
      },
      orderBy: { DES_MODULO: "asc" },
    }),
    prisma.t_ASIGNATURA.findMany({
      where: { EST_ASIGNATURA: "A" },
      select: {
        COD_ASIGNATURA: true,
        DES_ASIGNATURA: true,
      },
      orderBy: { DES_ASIGNATURA: "asc" },
    }),
  ]);

  return {
    carreras: carreras.map((r) => ({
      codigo: r.COD_CARRERA,
      nombre: r.DES_CARRERA,
    })),
    modulos: modulos.map((r) => ({
      codigo: r.COD_MODULO,
      nombre: r.DES_MODULO,
    })),
    asignaturas: asignaturas.map((r) => ({
      codigo: r.COD_ASIGNATURA,
      nombre: r.DES_ASIGNATURA,
    })),
  };
}

export async function crearOrganizacionCurso(formData: FormData) {
  await exigirSesion();

  const carrera = String(formData.get("carrera") ?? "").trim();
  const modulo = String(formData.get("modulo") ?? "").trim();
  const asignatura = String(formData.get("asignatura") ?? "").trim();
  const ordenTexto = String(formData.get("orden") ?? "").trim();
  const estado = String(formData.get("estado") ?? "A");
  const orden = Number(ordenTexto);

  if (!carrera || !modulo || !asignatura || !ordenTexto) {
    errorFormulario("campos_obligatorios");
  }

  if (!Number.isInteger(orden) || orden < 0 || orden > 99) {
    errorFormulario("orden_invalido");
  }

  try {
    validarEstado(estado);

    await prisma.$executeRaw`
      EXEC dbo.SP_CURSOS_NUEVO
        ${carrera},
        ${modulo},
        ${asignatura},
        ${orden},
        ${estado}
    `;
  } catch (error) {
    if (esRedireccion(error)) throw error;
    console.error("Error al registrar la organización del curso:", error);
    errorFormulario("no_se_pudo_crear");
  }

  revalidatePath(PATH);
  redirect(`${PATH}?resultado=creado`);
}

export async function actualizarOrganizacionCurso(formData: FormData) {
  await exigirSesion();

  const codigo = String(formData.get("codigo") ?? "").trim();
  const carrera = String(formData.get("carrera") ?? "").trim();
  const modulo = String(formData.get("modulo") ?? "").trim();
  const asignatura = String(formData.get("asignatura") ?? "").trim();
  const ordenTexto = String(formData.get("orden") ?? "").trim();
  const estado = String(formData.get("estado") ?? "");
  const orden = Number(ordenTexto);

  if (!codigo || !carrera || !modulo || !asignatura || !ordenTexto) {
    errorFormulario("campos_obligatorios");
  }

  if (codigo.length > 4) {
    errorFormulario("codigo_invalido");
  }

  if (!Number.isInteger(orden) || orden < 0 || orden > 99) {
    errorFormulario("orden_invalido");
  }

  try {
    validarEstado(estado);

    await prisma.$executeRaw`
      EXEC dbo.SP_CURSOS_MODIFICA
        ${codigo},
        ${carrera},
        ${modulo},
        ${asignatura},
        ${orden},
        ${estado}
    `;
  } catch (error) {
    if (esRedireccion(error)) throw error;
    console.error("Error al actualizar la organización del curso:", error);
    errorFormulario("no_se_pudo_actualizar");
  }

  revalidatePath(PATH);
  redirect(`${PATH}?resultado=actualizado`);
}

export async function anularOrganizacionCurso(formData: FormData) {
  await exigirSesion();

  const codigo = String(formData.get("codigo") ?? "").trim();

  if (!codigo || codigo.length > 4) {
    errorFormulario("codigo_invalido");
  }

  try {
    await prisma.$executeRaw`
      EXEC dbo.SP_CURSOS_ANULA ${codigo}
    `;
  } catch (error) {
    if (esRedireccion(error)) throw error;
    console.error("Error al anular la organización del curso:", error);
    errorFormulario("no_se_pudo_anular");
  }

  revalidatePath(PATH);
  redirect(`${PATH}?resultado=anulado`);
}