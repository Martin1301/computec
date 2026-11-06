"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const RUTA = "/asistencia";

export type DocenteAsistencia = {
  codigo: string;
  nombre: string;
};

export type CursoAsistencia = {
  codigo: string;
  asignatura: string;
  modulo: string;
  horario: string;
};

export type MarcacionAsistencia = {
  id: string;
  alumno: string;
  fecha: string;
  hora: string;
};

export type ResultadoOperacion = {
  success: boolean;
  mensaje: string;
};

type RespuestaSP = {
  ESTADO: number | string;
  MENSAJE: string;
};

async function comprobarSesion() {
  const sesion = await getSession();

  if (!sesion) {
    redirect("/");
  }

  return sesion;
}

function fechaDMY(fecha: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return null;
  }

  const [anio, mes, dia] = fecha.split("-");

  const comprobacion = new Date(
    Date.UTC(Number(anio), Number(mes) - 1, Number(dia))
  );

  if (
    comprobacion.getUTCFullYear() !== Number(anio) ||
    comprobacion.getUTCMonth() !== Number(mes) - 1 ||
    comprobacion.getUTCDate() !== Number(dia)
  ) {
    return null;
  }

  return `${dia}/${mes}/${anio}`;
}

function fechaPresentacion(valor: Date | string | null): string {
  if (!valor) return "";

  const fecha = valor instanceof Date ? valor : new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const anio = fecha.getUTCFullYear();

  return `${dia}/${mes}/${anio}`;
}

function resultadoSP(filas: RespuestaSP[]): ResultadoOperacion {
  const fila = filas[0];

  if (!fila) {
    return {
      success: false,
      mensaje: "El procedimiento no devolvió una respuesta.",
    };
  }

  const success = Number(fila.ESTADO) === 1;

  return {
    success,
    mensaje: String(fila.MENSAJE ?? ""),
  };
}

export async function getDocentesAsistencia(): Promise<
  DocenteAsistencia[]
> {
  await comprobarSesion();

  return prisma.$queryRaw<DocenteAsistencia[]>`
    SELECT
      LTRIM(RTRIM(COD_DOCENTE)) AS codigo,
      LTRIM(RTRIM(NOM_DOCENTE)) AS nombre
    FROM dbo.T_PROFESOR
    WHERE EST_DOCENTE = 'A'
    ORDER BY NOM_DOCENTE
  `;
}

export async function getCursosAsistencia(
  codigoDocente: string
): Promise<CursoAsistencia[]> {
  await comprobarSesion();

  const docente = codigoDocente.trim();

  if (!docente || docente.length > 8) {
    return [];
  }

  return prisma.$queryRaw<CursoAsistencia[]>`
    SELECT
      LTRIM(RTRIM(IDOPERA)) AS codigo,
      LTRIM(RTRIM(DES_ASIGNATURA)) AS asignatura,
      LTRIM(RTRIM(DES_MODULO)) AS modulo,
      LTRIM(RTRIM(HORARIO_PROF)) AS horario
    FROM dbo.V_DOCENTE_CURSO
    WHERE COD_DOCENTE = ${docente}
      AND ESTADO = 'A'
    ORDER BY ORDEN
  `;
}

export async function getMarcacionesAsistencia(
  codigoDocente: string,
  idOpera: string,
  fecha: string
): Promise<MarcacionAsistencia[]> {
  await comprobarSesion();

  const docente = codigoDocente.trim();
  const curso = idOpera.trim();
  const fechaConsulta = fechaDMY(fecha);

  if (
    !docente ||
    !curso ||
    docente.length > 8 ||
    curso.length > 8 ||
    !fechaConsulta
  ) {
    return [];
  }

  const filas = await prisma.$queryRaw<
    {
      IDMARCA: string;
      NOMUNIDO: string;
      FECHAMARCA: Date | string;
      HORAMARCA: string | null;
    }[]
  >`
    EXEC dbo.SP_MARCACION_LISTA
      ${docente},
      ${curso},
      ${fechaConsulta}
  `;

  return filas.map((fila) => ({
    id: String(fila.IDMARCA ?? "").trim(),
    alumno: String(fila.NOMUNIDO ?? "").trim(),
    fecha: fechaPresentacion(fila.FECHAMARCA),
    hora: String(fila.HORAMARCA ?? "").trim(),
  }));
}

export async function getDetalleMarcacion(
  idMarca: string
): Promise<{
  id: string;
  alumno: string;
  fecha: string;
  hora: string;
} | null> {
  await comprobarSesion();

  const codigo = idMarca.trim();

  if (!codigo || codigo.length > 8) {
    return null;
  }

  const filas = await prisma.$queryRaw<
    {
      IDMARCA: string;
      NOMUNIDO: string;
      FECHAMARCA: Date | string;
      HORAMARCA: string | null;
    }[]
  >`
    SELECT
      IDMARCA,
      NOMUNIDO,
      FECHAMARCA,
      HORAMARCA
    FROM dbo.V_MARCACION
    WHERE IDMARCA = ${codigo}
  `;

  const fila = filas[0];

  if (!fila) {
    return null;
  }

  return {
    id: String(fila.IDMARCA ?? "").trim(),
    alumno: String(fila.NOMUNIDO ?? "").trim(),
    fecha: fechaPresentacion(fila.FECHAMARCA),
    hora: String(fila.HORAMARCA ?? "").trim(),
  };
}

export async function actualizarMarcacion(
  idMarca: string,
  hora: string
): Promise<ResultadoOperacion> {
  await comprobarSesion();

  const codigo = idMarca.trim();
  const nuevaHora = hora.trim();

  if (!codigo || codigo.length > 8) {
    return {
      success: false,
      mensaje: "El código de marcación no es válido.",
    };
  }

  if (nuevaHora.length > 8) {
    return {
      success: false,
      mensaje: "La marca no puede superar los 8 caracteres.",
    };
  }

  try {
    const filas = await prisma.$queryRaw<RespuestaSP[]>`
      EXEC dbo.SP_MARCACION_MODIFICA
        ${codigo},
        ${nuevaHora}
    `;

    const resultado = resultadoSP(filas);

    if (resultado.success) {
      revalidatePath(RUTA);
    }

    return resultado;
  } catch (error) {
    console.error("Error al actualizar marcación:", error);

    return {
      success: false,
      mensaje: "No se pudo actualizar la marcación.",
    };
  }
}

export async function eliminarMarcacion(
  idMarca: string
): Promise<ResultadoOperacion> {
  await comprobarSesion();

  const codigo = idMarca.trim();

  if (!codigo || codigo.length > 8) {
    return {
      success: false,
      mensaje: "El código de marcación no es válido.",
    };
  }

  try {
    const filas = await prisma.$queryRaw<RespuestaSP[]>`
      EXEC dbo.SP_MARCACION_ELIMINA ${codigo}
    `;

    const resultado = resultadoSP(filas);

    if (resultado.success) {
      revalidatePath(RUTA);
    }

    return resultado;
  } catch (error) {
    console.error("Error al eliminar marcación:", error);

    return {
      success: false,
      mensaje: "No se pudo eliminar la marcación.",
    };
  }
}

export type ReporteAsistencia = {
  cabecera: {
    anio: string;
    docente: string;
    modulo: string;
    horario: string;
    desde: string;
    hasta: string;
    asignatura: string;
  };
  fechas: {
    clave: string;
    etiqueta: string;
  }[];
  alumnos: {
    orden: number;
    codigo: string;
    nombre: string;
    marcaciones: Record<string, string>;
  }[];
};

function claveFechaReporte(valor: Date | string): string {
  if (valor instanceof Date) {
    return [
      valor.getUTCFullYear(),
      String(valor.getUTCMonth() + 1).padStart(2, "0"),
      String(valor.getUTCDate()).padStart(2, "0"),
    ].join("-");
  }

  const texto = String(valor).trim();

  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  return "";
}

export async function getReporteAsistencia(
  codigoDocente: string,
  idOpera: string
): Promise<ReporteAsistencia | null> {
  await comprobarSesion();

  const docente = codigoDocente.trim();
  const curso = idOpera.trim();

  if (!docente || !curso || docente.length > 8 || curso.length > 8) {
    return null;
  }

  const cabeceras = await prisma.$queryRaw<{
  ANIO: string | number | null;
  NOM_DOCENTE: string | null;
  DESHORARIO: string | null;
  DESDE: Date | string | null;
  HASTA: Date | string | null;
  DES_ASIGNATURA: string | null;
  DES_MODULO: string | null;
}[]>`
  SELECT TOP 1
    ANIO,
    NOM_DOCENTE,
    DES_HORARIO AS DESHORARIO,
    DESDE,
    HASTA,
    DES_ASIGNATURA,
    DES_MODULO
  FROM dbo.V_DOCENTE_CURSO
  WHERE COD_DOCENTE = ${docente}
    AND IDOPERA = ${curso}
`;

  const cabecera = cabeceras[0];
  if (!cabecera) return null;

  const filasFechas = await prisma.$queryRaw<{
    FECHAMARCA: Date | string;
  }[]>`
    SELECT DISTINCT FECHAMARCA
    FROM dbo.MARCACION
    WHERE CODDOCENTE = ${docente}
      AND IDOPERA = ${curso}
    ORDER BY FECHAMARCA
  `;

  const filasAlumnos = await prisma.$queryRaw<{
    ORDENS: number;
    NOMUNIDO: string;
    CODALUMNO: string;
  }[]>`
    EXEC dbo.SP_MARCACION_LISTA_1 ${docente}, ${curso}
  `;

  const filasMarcaciones = await prisma.$queryRaw<{
    CODALUMNO: string;
    FECHAMARCA: Date | string;
    HORAMARCA: string | null;
  }[]>`
    SELECT CODALUMNO, FECHAMARCA, HORAMARCA
    FROM dbo.V_MARCACION
    WHERE CODDOCENTE = ${docente}
      AND IDOPERA = ${curso}
  `;

  const fechas = filasFechas
    .map((fila) => {
      const clave = claveFechaReporte(fila.FECHAMARCA);
      if (!clave) return null;

      const [, mes, dia] = clave.split("-");
      return { clave, etiqueta: `${dia}/${mes}` };
    })
    .filter(
      (fecha): fecha is { clave: string; etiqueta: string } =>
        fecha !== null
    );

  const valoresPorAlumno = new Map<string, Map<string, Set<string>>>();

  for (const fila of filasMarcaciones) {
    const codigo = String(fila.CODALUMNO ?? "").trim();
    const clave = claveFechaReporte(fila.FECHAMARCA);
    const valorOriginal = String(fila.HORAMARCA ?? "").trim();

    if (!codigo || !clave || !valorOriginal) continue;

    // Se conserva la regla del reporte PHP:
    // valores de 5 o más caracteres se representan con "*".
    const valor = valorOriginal.length >= 5 ? "*" : valorOriginal;

    if (!valoresPorAlumno.has(codigo)) {
      valoresPorAlumno.set(codigo, new Map());
    }

    const fechasAlumno = valoresPorAlumno.get(codigo)!;

    if (!fechasAlumno.has(clave)) {
      fechasAlumno.set(clave, new Set());
    }

    // Set elimina duplicados después de aplicar la regla anterior.
    fechasAlumno.get(clave)!.add(valor);
  }

  const alumnos = filasAlumnos.map((fila) => {
    const codigo = String(fila.CODALUMNO ?? "").trim();
    const fechasAlumno = valoresPorAlumno.get(codigo);
    const marcaciones: Record<string, string> = {};

    for (const fecha of fechas) {
      const valores = fechasAlumno?.get(fecha.clave);
      marcaciones[fecha.clave] = valores
        ? Array.from(valores).join(" / ")
        : "";
    }

    return {
      orden: Number(fila.ORDENS),
      codigo,
      nombre: String(fila.NOMUNIDO ?? "").trim(),
      marcaciones,
    };
  });

  return {
    cabecera: {
      anio: String(cabecera.ANIO ?? ""),
      docente: String(cabecera.NOM_DOCENTE ?? ""),
      modulo: String(cabecera.DES_MODULO ?? ""),
      horario: String(cabecera.DESHORARIO ?? ""),
      desde: fechaPresentacion(cabecera.DESDE),
      hasta: fechaPresentacion(cabecera.HASTA),
      asignatura: String(cabecera.DES_ASIGNATURA ?? ""),
    },
    fechas,
    alumnos,
  };
}
