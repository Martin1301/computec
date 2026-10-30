
"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Profesor = {
  COD_DOCENTE: string;
  NOM_DOCENTE: string;
  EST_DOCENTE: string | null;
};

async function exigirSesion() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return session;
}

function validarEstado(estado: string) {
  if (estado !== "A" && estado !== "I") {
    throw new Error("El estado debe ser Activo o Inactivo.");
  }
}

function resultadoError(codigo: string): never {
  redirect(`/profesores?error=${encodeURIComponent(codigo)}`);
}

/** Lista y permite buscar docentes por código o nombre. */
export async function getProfesoresGlobales(
  buscar = ""
): Promise<Profesor[]> {
  await exigirSesion();

  const filtro = `%${buscar.trim()}%`;

  try {
    return await prisma.$queryRaw<Profesor[]>`
      SELECT
        COD_DOCENTE,
        NOM_DOCENTE,
        EST_DOCENTE
      FROM dbo.T_PROFESOR
      WHERE NOM_DOCENTE LIKE ${filtro}
         OR COD_DOCENTE LIKE ${filtro}
      ORDER BY NOM_DOCENTE
    `;
  } catch (error) {
    console.error("Error al consultar docentes:", error);
    throw new Error("No se pudo consultar la lista de docentes.");
  }
}

/** Registra un docente usando el procedimiento del sistema original. */
export async function crearProfesor(formData: FormData) {
  await exigirSesion();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const estado = String(formData.get("estado") ?? "A");

  if (!nombre) {
    resultadoError("nombre_obligatorio");
  }

  if (nombre.length > 150) {
    resultadoError("nombre_largo");
  }

  try {
    validarEstado(estado);

    await prisma.$executeRaw`
      EXEC dbo.SP_DOCENTE_NUEVO ${nombre}, ${estado}
    `;

    revalidatePath("/profesores");
    redirect("/profesores?resultado=creado");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }

    console.error("Error al registrar docente:", error);
    resultadoError("no_se_pudo_crear");
  }
}

/** Actualiza el nombre y el estado del docente. */
export async function actualizarProfesor(formData: FormData) {
  await exigirSesion();

  const codigo = String(formData.get("codigo") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const estado = String(formData.get("estado") ?? "");

  if (!codigo || !nombre) {
    resultadoError("datos_obligatorios");
  }

  if (codigo.length > 10 || nombre.length > 150) {
    resultadoError("datos_invalidos");
  }

  try {
    validarEstado(estado);

    await prisma.$executeRaw`
      EXEC dbo.SP_DOCENTE_MODIFICA ${codigo}, ${nombre}, ${estado}
    `;

    revalidatePath("/profesores");
    redirect("/profesores?resultado=actualizado");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }

    console.error("Error al actualizar docente:", error);
    resultadoError("no_se_pudo_actualizar");
  }
}

/** Anula un docente sin eliminar físicamente su registro. */
export async function anularProfesor(formData: FormData) {
  await exigirSesion();

  const codigo = String(formData.get("codigo") ?? "").trim();

  if (!codigo || codigo.length > 10) {
    resultadoError("codigo_invalido");
  }

  try {
    await prisma.$executeRaw`
      EXEC dbo.SP_DOCENTE_ANULA ${codigo}
    `;

    revalidatePath("/profesores");
    redirect("/profesores?resultado=anulado");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }

    console.error("Error al anular docente:", error);
    resultadoError("no_se_pudo_anular");
  }
}
