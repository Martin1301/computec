
"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Horario = {
  COD_HORARIO: string;
  DES_HORARIO: string;
  COD_TURNO: string;
  DESCRIPCION: string;
  ESTADO: string;
  SIGLA: string | null;
  DES_TURNO?: string;
};

export type Turno = {
  COD_TURNO: string;
  DES_TURNO: string;
};

type ResultadoSP = {
  ESTADO: number;
  MENSAJE: string;
};

async function exigirSesion() {
  const session = await getSession();
  if (!session) redirect("/");
}

function volverConError(error: string): never {
  redirect(
    `/horarios?error=${encodeURIComponent(error)}&aviso=${Date.now()}`
  );
}

function esRedireccion(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error
  );
}

function validarEstado(estado: string) {
  if (estado !== "A" && estado !== "I") {
    throw new Error("Estado no válido.");
  }
}

function procedimientoCorrecto(resultado: ResultadoSP[]) {
  return Number(resultado[0]?.ESTADO) === 1;
}

export async function getHorarios(buscar = ""): Promise<Horario[]> {
  await exigirSesion();

  try {
    return await prisma.$queryRaw<Horario[]>`
      EXEC dbo.SP_HORARIO_LISTA ${buscar.trim()}
    `;
  } catch (error) {
    console.error("Error al listar horarios:", error);
    throw new Error(
      "No se pudieron consultar los horarios. Verifica el procedimiento SP_HORARIO_LISTA."
    );
  }
}

export async function getTurnos(): Promise<Turno[]> {
  await exigirSesion();

  try {
    return await prisma.t_TURNO.findMany({
      where: { EST_TURNO: "A" },
      select: {
        COD_TURNO: true,
        DES_TURNO: true,
      },
      orderBy: {
        DES_TURNO: "asc",
      },
    });
  } catch (error) {
    console.error("Error al consultar turnos:", error);
    throw new Error("No se pudieron consultar los turnos disponibles.");
  }
}

export async function crearHorario(formData: FormData) {
  await exigirSesion();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const turno = String(formData.get("turno") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const sigla = String(formData.get("sigla") ?? "").trim();
  const estado = String(formData.get("estado") ?? "A");

  if (!nombre || !turno || !descripcion) {
    volverConError("campos_obligatorios");
  }

  if (
    nombre.length > 80 ||
    descripcion.length > 100 ||
    sigla.length > 7
  ) {
    volverConError("datos_demasiado_largos");
  }

  validarEstado(estado);

  let resultado: ResultadoSP[];

  try {
    resultado = await prisma.$queryRaw<ResultadoSP[]>`
      EXEC dbo.SP_HORARIO_NUEVO
        ${nombre},
        ${turno},
        ${descripcion},
        ${sigla},
        ${estado}
    `;
  } catch (error) {
    console.error("Error al crear horario:", error);
    volverConError("no_se_pudo_crear");
  }

  if (!procedimientoCorrecto(resultado)) {
    console.error("SP_HORARIO_NUEVO:", resultado);
    volverConError("no_se_pudo_crear");
  }

  revalidatePath("/horarios");
  redirect(`/horarios?resultado=creado&aviso=${Date.now()}`);
}

export async function actualizarHorario(formData: FormData) {
  await exigirSesion();

  const codigo = String(formData.get("codigo") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const turno = String(formData.get("turno") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const sigla = String(formData.get("sigla") ?? "").trim();
  const estado = String(formData.get("estado") ?? "");

  if (!codigo || !nombre || !turno || !descripcion) {
    volverConError("campos_obligatorios");
  }

  if (
    codigo.length > 3 ||
    nombre.length > 80 ||
    descripcion.length > 100 ||
    sigla.length > 7
  ) {
    volverConError("datos_demasiado_largos");
  }

  validarEstado(estado);

  let resultado: ResultadoSP[];

  try {
    resultado = await prisma.$queryRaw<ResultadoSP[]>`
      EXEC dbo.SP_HORARIO_MODIFICA
        ${codigo},
        ${nombre},
        ${turno},
        ${descripcion},
        ${sigla},
        ${estado}
    `;
  } catch (error) {
    console.error("Error al actualizar horario:", error);
    volverConError("no_se_pudo_actualizar");
  }

  if (!procedimientoCorrecto(resultado)) {
    console.error("SP_HORARIO_MODIFICA:", resultado);
    volverConError("no_se_pudo_actualizar");
  }

  revalidatePath("/horarios");
  redirect(`/horarios?resultado=actualizado&aviso=${Date.now()}`);
}

export async function anularHorario(formData: FormData) {
  await exigirSesion();

  const codigo = String(formData.get("codigo") ?? "").trim();

  if (!codigo || codigo.length > 3) {
    volverConError("codigo_invalido");
  }

  let resultado: ResultadoSP[];

  try {
    resultado = await prisma.$queryRaw<ResultadoSP[]>`
      EXEC dbo.SP_HORARIO_ANULA ${codigo}
    `;
  } catch (error) {
    console.error("Error al eliminar horario:", error);
    volverConError("no_se_pudo_anular");
  }

  if (!procedimientoCorrecto(resultado)) {
    console.error("SP_HORARIO_ANULA:", resultado);
    volverConError("no_se_pudo_anular");
  }

  revalidatePath("/horarios");
  redirect(`/horarios?resultado=anulado&aviso=${Date.now()}`);
}
