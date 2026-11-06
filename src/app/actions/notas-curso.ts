"use server";

import { prisma } from "@/lib/db";
import { connection } from "next/server";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const RUTA = "/notas";

export type OperacionNotaDetalle = {
  IDOPERA: string;
  COD_DOCENTE: string;
  NOM_DOCENTE: string;
  DES_CARRERA: string;
  DES_MODULO: string;
  DES_ASIGNATURA: string;
  DESHORARIO: string;
  DESDE: Date | null;
  HASTA: Date | null;
  ESTADO: string;
};

export type AlumnoDisponibleNota = {
  codigo: string;
  nombre: string;
};

export type ResultadoProcedimiento = {
  ESTADO: number;
  MENSAJE: string;
};

export type DatosGuardarNota = {
  idOpera: string;
  idNota: string;
  A1: number;
  A2: number;
  A3: number;
  A4: number;
  A5: number;
  A6: number;
  C2: number;
  M2: number;
  FINAL: number;
  OBSERVACION: string;
};

async function comprobarSesion() {
  await connection();

  const sesion = await getSession();

  if (!sesion) {
    redirect("/");
  }

  return sesion;
}

function validarCodigo(valor: string, nombre: string) {
  const codigo = valor.trim();

  if (!codigo || codigo.length > 8) {
    throw new Error(`${nombre} inválido.`);
  }

  return codigo;
}

function validarNota(valor: number, campo: string) {
  if (
    !Number.isSafeInteger(valor) ||
    valor < 0
  ) {
    throw new Error(`La calificación ${campo} debe ser un entero no negativo.`);
  }

  return valor;
}

function interpretarRespuesta(
  filas: ResultadoProcedimiento[]
): ResultadoProcedimiento {
  const respuesta = filas[0];

  if (!respuesta) {
    return {
      ESTADO: 0,
      MENSAJE: "El procedimiento no devolvió una respuesta.",
    };
  }

  return {
    ESTADO: Number(respuesta.ESTADO),
    MENSAJE: String(respuesta.MENSAJE ?? ""),
  };
}

/**
 * Obtiene los datos académicos de una operación,
 * incluso si todavía no tiene alumnos registrados.
 */
export async function getDetalleOperacionNotas(
  idOpera: string
): Promise<OperacionNotaDetalle | null> {
  await comprobarSesion();

  const codigo = validarCodigo(idOpera, "Operación");

  try {
    const filas = await prisma.$queryRaw<OperacionNotaDetalle[]>`
      SELECT TOP (1)
        IDOPERA,
        COD_DOCENTE,
        NOM_DOCENTE,
        DES_CARRERA,
        DES_MODULO,
        DES_ASIGNATURA,
        DESCRIPCION AS DESHORARIO,
        DESDE,
        HASTA,
        ESTADO
      FROM dbo.V_DOCENTE_CURSO
      WHERE IDOPERA = ${codigo}
    `;

    return filas[0] ?? null;
  } catch (error) {
    console.error("Error al consultar la operación de notas:", error);
    throw new Error("No se pudo consultar la información de la operación.");
  }
}

/**
 * Lista las calificaciones utilizando el mismo procedimiento
 * almacenado que utilizaba el sistema PHP.
 */
export async function getNotasCurso(idOpera: string) {
  await comprobarSesion();

  const codigo = validarCodigo(idOpera, "Operación");

  try {
    const detalle = await getDetalleOperacionNotas(codigo);

    if (!detalle) {
      return [];
    }

    const filas = await prisma.$queryRaw<any[]>`
      EXEC dbo.SP_LISTA_NOTA_ALUMNO
        ${detalle.COD_DOCENTE},
        ${codigo}
    `;

    return filas.map((fila) => ({
      ...fila,
      FALTA: Number(fila.FALTA ?? 0),
    }));
  } catch (error) {
    console.error("Error al listar las notas del curso:", error);
    throw new Error("No se pudieron cargar las calificaciones.");
  }
}

/**
 * Busca alumnos activos por nombre.
 * Solo devuelve alumnos que todavía no están inscritos
 * en la operación seleccionada.
 */
export async function buscarAlumnosParaNota(
  idOpera: string,
  buscar: string
): Promise<AlumnoDisponibleNota[]> {
  await comprobarSesion();

  const operacion = validarCodigo(idOpera, "Operación");
  const termino = buscar.trim().slice(0, 100);

  if (termino.length < 2) {
    return [];
  }

  try {
    return await prisma.$queryRaw<AlumnoDisponibleNota[]>`
      SELECT TOP (20)
        A.CODALUMNO AS codigo,
        A.NOMUNIDO AS nombre
      FROM dbo.T_ALUMNOS A
      WHERE
        A.ESTADO = 'A'
        AND A.NOMUNIDO LIKE ${termino + "%"}
        AND NOT EXISTS (
          SELECT 1
          FROM dbo.NOTA_ALUMNO N
          WHERE N.IDOPERA = ${operacion}
            AND N.CODALUMNO = A.CODALUMNO
        )
      ORDER BY A.NOMUNIDO
    `;
  } catch (error) {
    console.error("Error al buscar alumnos para notas:", error);
    throw new Error("No se pudo realizar la búsqueda de alumnos.");
  }
}

/**
 * Registra un alumno y genera sus marcaciones mediante
 * SP_AGREGA_ALUMNO.
 */
export async function agregarAlumnoNota(
  idOpera: string,
  codAlumno: string
) {
  await comprobarSesion();

  const operacion = validarCodigo(idOpera, "Operación");
  const alumno = validarCodigo(codAlumno, "Alumno");

  try {
    const existente = await prisma.$queryRaw<{ TOTAL: number }[]>`
      SELECT COUNT(*) AS TOTAL
      FROM dbo.NOTA_ALUMNO
      WHERE IDOPERA = ${operacion}
        AND CODALUMNO = ${alumno}
    `;

    if (Number(existente[0]?.TOTAL ?? 0) > 0) {
      return {
        success: false,
        mensaje: "El alumno ya está registrado en esta operación.",
      };
    }

    const alumnoActivo = await prisma.$queryRaw<{ TOTAL: number }[]>`
      SELECT COUNT(*) AS TOTAL
      FROM dbo.T_ALUMNOS
      WHERE CODALUMNO = ${alumno}
        AND ESTADO = 'A'
    `;

    if (Number(alumnoActivo[0]?.TOTAL ?? 0) === 0) {
      return {
        success: false,
        mensaje: "El alumno no existe o no se encuentra activo.",
      };
    }

    const filas = await prisma.$queryRaw<ResultadoProcedimiento[]>`
      EXEC dbo.SP_AGREGA_ALUMNO ${operacion}, ${alumno}
    `;

    const respuesta = interpretarRespuesta(filas);

    if (respuesta.ESTADO === 1) {
      revalidatePath(`${RUTA}/curso/${operacion}`);
    }

    return {
      success: respuesta.ESTADO === 1,
      mensaje: respuesta.MENSAJE,
    };
  } catch (error) {
    console.error("Error al agregar alumno a notas:", error);

    return {
      success: false,
      mensaje: "No se pudo agregar el alumno a la operación.",
    };
  }
}

/**
 * Guarda las calificaciones mediante SP_NOTA_GRABA.
 * CE1, CE2 y LOGRO son calculados por SQL Server.
 */
export async function guardarNotaAlumno(datos: DatosGuardarNota) {
  await comprobarSesion();

  try {
    const operacion = validarCodigo(datos.idOpera, "Operación");
    const idNota = validarCodigo(datos.idNota, "Nota");

    const observacion = String(datos.OBSERVACION ?? "").trim();

    if (observacion.length > 50) {
      return {
        success: false,
        mensaje: "La observación no puede superar los 50 caracteres.",
      };
    }

    const a1 = validarNota(datos.A1, "A1");
    const a2 = validarNota(datos.A2, "A2");
    const a3 = validarNota(datos.A3, "A3");
    const a4 = validarNota(datos.A4, "A4");
    const a5 = validarNota(datos.A5, "A5");
    const a6 = validarNota(datos.A6, "A6");
    const c2 = validarNota(datos.C2, "C2");
    const m2 = validarNota(datos.M2, "M2");
    const final = validarNota(datos.FINAL, "FINAL");

    const existe = await prisma.$queryRaw<{ TOTAL: number }[]>`
      SELECT COUNT(*) AS TOTAL
      FROM dbo.NOTA_ALUMNO
      WHERE IDNOTA = ${idNota}
        AND IDOPERA = ${operacion}
    `;

    if (Number(existe[0]?.TOTAL ?? 0) === 0) {
      return {
        success: false,
        mensaje: "No se encontró la nota dentro de esta operación.",
      };
    }

    const filas = await prisma.$queryRaw<ResultadoProcedimiento[]>`
      EXEC dbo.SP_NOTA_GRABA
        ${idNota},
        ${a1},
        ${a2},
        ${a3},
        ${0},
        ${a4},
        ${a5},
        ${a6},
        ${c2},
        ${m2},
        ${final},
        ${0},
        ${0},
        ${observacion}
    `;

    const respuesta = interpretarRespuesta(filas);

    if (respuesta.ESTADO === 1) {
      revalidatePath(`${RUTA}/curso/${operacion}`);
    }

    return {
      success: respuesta.ESTADO === 1,
      mensaje: respuesta.MENSAJE,
    };
  } catch (error) {
    console.error("Error al guardar calificaciones:", error);

    return {
      success: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No se pudieron guardar las calificaciones.",
    };
  }
}

/**
 * Elimina la nota y sus marcaciones mediante SP_NOTA_ELIMINA.
 */
export async function eliminarAlumnoNota(
  idOpera: string,
  idNota: string
) {
  await comprobarSesion();

  const operacion = validarCodigo(idOpera, "Operación");
  const nota = validarCodigo(idNota, "Nota");

  try {
    const existe = await prisma.$queryRaw<{ TOTAL: number }[]>`
      SELECT COUNT(*) AS TOTAL
      FROM dbo.NOTA_ALUMNO
      WHERE IDNOTA = ${nota}
        AND IDOPERA = ${operacion}
    `;

    if (Number(existe[0]?.TOTAL ?? 0) === 0) {
      return {
        success: false,
        mensaje: "No se encontró el registro que deseas eliminar.",
      };
    }

    const filas = await prisma.$queryRaw<ResultadoProcedimiento[]>`
      EXEC dbo.SP_NOTA_ELIMINA ${nota}
    `;

    const respuesta = interpretarRespuesta(filas);

    if (respuesta.ESTADO === 1) {
      revalidatePath(`${RUTA}/curso/${operacion}`);
    }

    return {
      success: respuesta.ESTADO === 1,
      mensaje: respuesta.MENSAJE,
    };
  } catch (error) {
    console.error("Error al eliminar alumno de notas:", error);

    return {
      success: false,
      mensaje: "No se pudo eliminar el registro de notas.",
    };
  }
}
