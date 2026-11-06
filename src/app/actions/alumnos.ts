"use server"

import { prisma } from "@/lib/db"

// Función para obtener los datos actuales de un solo alumno
export async function getAlumnoByCodigo(codigo: string) {
  try {
    const alumno = await prisma.t_ALUMNOS.findUnique({
      where: { CODALUMNO: codigo }
    })
    return alumno
  } catch (error) {
    console.error("Error al buscar el alumno:", error)
    return null
  }
}

// Función para procesar la actualización en la BD
export async function updateAlumno(codigo: string, formData: FormData) {
  
  const apellidoPat = formData.get("apellidoPat")?.toString()
  const apellidoMat = formData.get("apellidoMat")?.toString()
  const nombres = formData.get("nombres")?.toString()
  const email = formData.get("email")?.toString()
  const estado = formData.get("estado")?.toString()

  if (!apellidoPat || !apellidoMat || !nombres) {
    return { error: "Los campos de nombres y apellidos son obligatorios." }
  }

  try {
    await prisma.t_ALUMNOS.update({
      where: { CODALUMNO: codigo },
      data: {
        APELLIDO_PAT: apellidoPat,
        APELLIDO_MAT: apellidoMat,
        NOMBRES: nombres,
        EMAIL: email,
        ESTADO: estado || "A"
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar en SQL Server:", error)
    return { error: "No se pudieron guardar los cambios en la base de datos." }
  }
}



export type ResultadoAlumnos = {
  alumnos: {
    CODALUMNO: string;
    APELLIDO_PAT: string;
    APELLIDO_MAT: string;
    NOMBRES: string;
    EMAIL: string | null;
    ESTADO: string | null;
  }[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
};

export async function getAlumnos(
  buscar = "",
  paginaSolicitada = 1
): Promise<ResultadoAlumnos> {
  const termino = buscar.trim().slice(0, 150);
  const porPagina = 10;

  const paginaInicial = Number.isFinite(paginaSolicitada)
    ? Math.max(1, Math.floor(paginaSolicitada))
    : 1;

  const where = termino
    ? {
        OR: [
          { CODALUMNO: { contains: termino } },
          { APELLIDO_PAT: { contains: termino } },
          { APELLIDO_MAT: { contains: termino } },
          { NOMBRES: { contains: termino } },
          { NOMUNIDO: { contains: termino } },
          { EMAIL: { contains: termino } },
        ],
      }
    : undefined;

  try {
    // Contar los registros que coinciden con la búsqueda.
    const total = await prisma.t_ALUMNOS.count({
      where,
    });

    const totalPaginas = Math.max(
      1,
      Math.ceil(total / porPagina)
    );

    // Evitar solicitar páginas que no existen.
    const pagina = Math.min(paginaInicial, totalPaginas);

    const desplazamiento = (pagina - 1) * porPagina;

    // Consultar únicamente los alumnos de la página actual.
    const alumnos = await prisma.t_ALUMNOS.findMany({
      where,
      skip: desplazamiento,
      take: porPagina,
      orderBy: [
        { APELLIDO_PAT: "asc" },
        { APELLIDO_MAT: "asc" },
        { NOMBRES: "asc" },
        { CODALUMNO: "asc" },
      ],
      select: {
        CODALUMNO: true,
        APELLIDO_PAT: true,
        APELLIDO_MAT: true,
        NOMBRES: true,
        EMAIL: true,
        ESTADO: true,
      },
    });

    return {
      alumnos,
      total,
      pagina,
      totalPaginas,
      porPagina,
    };
  } catch (error) {
    console.error("Error al consultar alumnos en SQL Server:", error);
    throw new Error("No se pudieron cargar los alumnos.");
  }
}


// (Mantén las funciones de getAlumnos, getAlumnoByCodigo y updateAlumno que ya creamos)

// Función para INSERTAR un nuevo alumno con código automático.
export async function createAlumno(formData: FormData) {
  const apellidoPat = formData.get("apellidoPat")?.toString().trim()
  const apellidoMat = formData.get("apellidoMat")?.toString().trim()
  const nombres = formData.get("nombres")?.toString().trim()
  const fechaNacStr = formData.get("fechaNac")?.toString()
  const sexo = formData.get("sexo")?.toString()
  const domicilio = formData.get("domicilio")?.toString().trim()
  const codLocal = formData.get("codLocal")?.toString().trim() || "00"
  const telefono = formData.get("telefono")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const codigoAsist = formData.get("codigoAsist")?.toString().trim()
  const estado = formData.get("estado")?.toString() || "A"

  if (
    !apellidoPat ||
    !apellidoMat ||
    !nombres ||
    !fechaNacStr ||
    !sexo ||
    !codLocal ||
    !codigoAsist
  ) {
    return {
      error: "Por favor, complete todos los campos obligatorios del registro.",
    }
  }

  if (!["M", "F"].includes(sexo)) {
    return { error: "El sexo seleccionado no es válido." }
  }

  const fechaNac = new Date(`${fechaNacStr}T00:00:00`)

  if (Number.isNaN(fechaNac.getTime())) {
    return { error: "La fecha de nacimiento no es válida." }
  }

  if (codLocal.length > 2 || codigoAsist.length > 20) {
    return { error: "Revise la longitud del código local o de asistencia." }
  }

  const nomUnido = `${apellidoPat} ${apellidoMat} ${nombres}`.toUpperCase()

  try {
    const codAlumno = await prisma.$transaction(async (tx) => {
      // El bloqueo exclusivo evita que dos registros simultáneos
      // calculen el mismo código.
      const resultado = await tx.$queryRaw<{ ULTIMO: bigint }[]>`
        SELECT
          COALESCE(
            MAX(TRY_CONVERT(BIGINT, CODALUMNO)),
            CONVERT(BIGINT, 0)
          ) AS ULTIMO
        FROM dbo.T_ALUMNOS WITH (TABLOCKX, HOLDLOCK)
      `

      const ultimoCodigo = Number(resultado[0]?.ULTIMO ?? 0n)
      const siguienteCodigo = ultimoCodigo + 1

      if (
        !Number.isSafeInteger(siguienteCodigo) ||
        siguienteCodigo > 99999999
      ) {
        throw new Error("Se alcanzó el límite de códigos de ocho dígitos.")
      }

      const nuevoCodigo = String(siguienteCodigo).padStart(8, "0")

      await tx.t_ALUMNOS.create({
        data: {
          CODALUMNO: nuevoCodigo,
          APELLIDO_PAT: apellidoPat.toUpperCase(),
          APELLIDO_MAT: apellidoMat.toUpperCase(),
          NOMBRES: nombres.toUpperCase(),
          FECHA_NAC: fechaNac,
          SEXO: sexo,
          DOMICILIO: domicilio || null,
          COD_LOCAL: codLocal,
          TELEFONO: telefono || null,
          EMAIL: email || null,
          CODIGO_ASIST: codigoAsist,
          ESTADO: estado,
          NOMUNIDO: nomUnido,
        },
      })

      return nuevoCodigo
    })

    return { success: true, codAlumno }
  } catch (error) {
    console.error("Error al insertar alumno en SQL Server:", error)

    if (error instanceof Error && error.message.includes("límite de códigos")) {
      return { error: error.message }
    }

    return {
      error: "No se pudo guardar el registro del alumno en la base de datos.",
    }
  }
}
