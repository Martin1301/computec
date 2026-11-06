"use server";

import { prisma } from "@/lib/db";
import { connection } from "next/server";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type DetalleOperacionNotas = {
  IDOPERA: string;
  COD_DOCENTE: string;
  NOM_DOCENTE: string;
  DES_CARRERA: string | null;
  DES_MODULO: string | null;
  DES_ASIGNATURA: string | null;
  DESHORARIO: string | null;
  DESDE: Date | null;
  HASTA: Date | null;
  ESTADO: string | null;
};

export type AlumnoBusquedaNotas = {
  codigo: string;
  nombre: string;
};

type RespuestaProcedimiento = {
  ESTADO: number | bigint | string;
  MENSAJE: string;
};

async function prepararAccionNotas() {
  await connection();

  const sesion = await getSession();

  if (!sesion) {
    redirect("/");
  }
}

function respuestaSP(resultado: RespuestaProcedimiento[]) {
  const respuesta = resultado?.[0];

  if (!respuesta) {
    return {
      ok: false,
      mensaje: "El procedimiento no devolvió una respuesta válida.",
    };
  }

  return {
    ok: Number(respuesta.ESTADO) === 1,
    mensaje: String(respuesta.MENSAJE ?? ""),
  };
}

/**
 * Obtener información de una operación.
 */
export async function getDetalleOperacionNotas(
  idOpera: string
): Promise<DetalleOperacionNotas | null> {
  await prepararAccionNotas();

  const codigo = idOpera.trim();

  if (!codigo || codigo.length > 8) {
    return null;
  }

  try {
    const filas = await prisma.$queryRaw<DetalleOperacionNotas[]>`
      SELECT TOP (1)
        CAST(V.IDOPERA AS VARCHAR(8)) AS IDOPERA,
        V.COD_DOCENTE,
        V.NOM_DOCENTE,
        V.DES_CARRERA,
        V.DES_MODULO,
        V.DES_ASIGNATURA,
        V.DESCRIPCION AS DESHORARIO,
        V.DESDE,
        V.HASTA,
        V.ESTADO
      FROM dbo.V_DOCENTE_CURSO V
      WHERE V.IDOPERA = ${codigo}
    `;

    return filas[0] ?? null;
  } catch (error) {
    console.error("Error al consultar la operación:", error);
    return null;
  }
}

/**
 * Buscar alumnos activos por nombre.
 */
export async function buscarAlumnosParaNotas(
  buscar: string
): Promise<AlumnoBusquedaNotas[]> {
  await prepararAccionNotas();

  const termino = buscar.trim().slice(0, 100);

  if (termino.length < 2) {
    return [];
  }

  try {
    const alumnos = await prisma.$queryRaw<
      { codigo: string; nombre: string }[]
    >`
      SELECT TOP (20)
        CODALUMNO AS codigo,
        NOMUNIDO AS nombre
      FROM dbo.T_ALUMNOS
      WHERE ESTADO = 'A'
        AND NOMUNIDO LIKE ${termino + "%"}
      ORDER BY NOMUNIDO ASC
    `;

    return alumnos.map((alumno) => ({
      codigo: String(alumno.codigo),
      nombre: String(alumno.nombre),
    }));
  } catch (error) {
    console.error("Error al buscar alumnos:", error);
    return [];
  }
}

/**
 * Agregar alumno a una operación mediante SP_AGREGA_ALUMNO.
 */
export async function agregarAlumnoOperacion(
  idOpera: string,
  codAlumno: string
) {
  await prepararAccionNotas();

  const operacion = idOpera.trim();
  const alumno = codAlumno.trim();

  if (
    !operacion ||
    operacion.length > 8 ||
    !alumno ||
    alumno.length > 8
  ) {
    return {
      ok: false,
      mensaje: "Los códigos de operación o alumno no son válidos.",
    };
  }

  try {
    const existeOperacion = await prisma.$queryRaw<{ TOTAL: number }[]>`
      SELECT COUNT(*) AS TOTAL
      FROM dbo.V_DOCENTE_CURSO
      WHERE IDOPERA = ${operacion}
        AND ESTADO = 'A'
    `;

    if (Number(existeOperacion[0]?.TOTAL ?? 0) === 0) {
      return {
        ok: false,
        mensaje: "La operación no existe o no está activa.",
      };
    }

    const existeAlumno = await prisma.$queryRaw<{ TOTAL: number }[]>`
      SELECT COUNT(*) AS TOTAL
      FROM dbo.T_ALUMNOS
      WHERE CODALUMNO = ${alumno}
        AND ESTADO = 'A'
    `;

    if (Number(existeAlumno[0]?.TOTAL ?? 0) === 0) {
      return {
        ok: false,
        mensaje: "El alumno no existe o no está activo.",
      };
    }

    const notaExistente = await prisma.$queryRaw<{ TOTAL: number }[]>`
      SELECT COUNT(*) AS TOTAL
      FROM dbo.NOTA_ALUMNO
      WHERE IDOPERA = ${operacion}
        AND CODALUMNO = ${alumno}
    `;

    if (Number(notaExistente[0]?.TOTAL ?? 0) > 0) {
      return {
        ok: false,
        mensaje: "El alumno ya está registrado en esta operación.",
      };
    }

    const resultado = await prisma.$queryRaw<RespuestaProcedimiento[]>`
      EXEC dbo.SP_AGREGA_ALUMNO ${operacion}, ${alumno}
    `;

    const respuesta = respuestaSP(resultado);

    if (respuesta.ok) {
      revalidatePath("/notas");
      revalidatePath(`/notas/curso/${operacion}`);
    }

    return respuesta;
  } catch (error) {
    console.error("Error al agregar alumno:", error);

    return {
      ok: false,
      mensaje: "No se pudo agregar al alumno.",
    };
  }
}

/**
 * Guardar calificaciones mediante SP_NOTA_GRABA.
 * CE1, CE2 y LOGRO son calculados por SQL Server.
 */
export async function guardarNotaAlumno(datos: {
  idNota: string;
  A1: number | null;
  A2: number | null;
  A3: number | null;
  A4: number | null;
  A5: number | null;
  A6: number | null;
  C2: number | null;
  M2: number | null;
  FINAL: number | null;
  OBSERVACION: string;
}) {
  await prepararAccionNotas();

  const idNota = datos.idNota.trim();
  const observacion = datos.OBSERVACION.trim();

  if (!idNota || idNota.length > 8) {
    return {
      ok: false,
      mensaje: "El código de la nota no es válido.",
    };
  }

  if (observacion.length > 50) {
    return {
      ok: false,
      mensaje: "La observación no puede superar los 50 caracteres.",
    };
  }

  const campos = [
    datos.A1,
    datos.A2,
    datos.A3,
    datos.A4,
    datos.A5,
    datos.A6,
    datos.C2,
    datos.M2,
    datos.FINAL,
  ];

  for (const nota of campos) {
    if (
      nota !== null &&
      (!Number.isInteger(nota) || nota < 0 || nota > 20)
    ) {
      return {
        ok: false,
        mensaje: "Las calificaciones deben ser números enteros entre 0 y 20.",
      };
    }
  }

  const valores = campos.map((nota) => nota ?? 0);

  try {
    const resultado = await prisma.$queryRaw<RespuestaProcedimiento[]>`
      EXEC dbo.SP_NOTA_GRABA
        ${idNota},
        ${valores[0]},
        ${valores[1]},
        ${valores[2]},
        ${0},
        ${valores[3]},
        ${valores[4]},
        ${valores[5]},
        ${valores[6]},
        ${valores[7]},
        ${valores[8]},
        ${0},
        ${0},
        ${observacion}
    `;

    const respuesta = respuestaSP(resultado);

    if (respuesta.ok) {
      revalidatePath("/notas");
      revalidatePath("/notas/curso/[idOpera]", "page");
    }

    return respuesta;
  } catch (error) {
    console.error("Error al guardar las calificaciones:", error);

    return {
      ok: false,
      mensaje: "No se pudieron guardar las calificaciones.",
    };
  }
}

/**
 * Eliminar nota mediante SP_NOTA_ELIMINA.
 * El procedimiento también elimina las marcaciones asociadas.
 */
export async function eliminarNotaAlumno(idNota: string) {
  await prepararAccionNotas();

  const codigo = idNota.trim();

  if (!codigo || codigo.length > 8) {
    return {
      ok: false,
      mensaje: "El código de la nota no es válido.",
    };
  }

  try {
    const operacion = await prisma.$queryRaw<{ IDOPERA: string }[]>`
      SELECT IDOPERA
      FROM dbo.NOTA_ALUMNO
      WHERE IDNOTA = ${codigo}
    `;

    if (!operacion[0]) {
      return {
        ok: false,
        mensaje: "No se encontró el registro de la nota.",
      };
    }

    const resultado = await prisma.$queryRaw<RespuestaProcedimiento[]>`
      EXEC dbo.SP_NOTA_ELIMINA ${codigo}
    `;

    const respuesta = respuestaSP(resultado);

    if (respuesta.ok) {
      revalidatePath("/notas");
      revalidatePath(`/notas/curso/${String(operacion[0].IDOPERA)}`);
    }

    return respuesta;
  } catch (error) {
    console.error("Error al eliminar la nota:", error);

    return {
      ok: false,
      mensaje: "No se pudo eliminar el registro.",
    };
  }
}
