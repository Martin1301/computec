"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const RUTA = "/docente-curso";

export type OpcionDocenteCurso = {
  codigo: string;
  nombre: string;
};

export type DocenteCurso = {
  codigo: string;
  idCurso: string;
  carrera: string;
  modulo: string;
  asignatura: string;
  docente: string;
  codigoDocente: string;
  horario: string;
  codigoHorario: string;
  desde: string;
  hasta: string;
  estado: string;
};

export type ResultadoDocenteCurso = {
  asignaciones: DocenteCurso[];
  total: number;
  pagina: number;
};

type RespuestaProcedimiento = {
  ESTADO: number;
  MENSAJE: string;
};

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim();
}

function fechaSQL(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;

  const fecha = new Date(`${valor}T00:00:00.000Z`);

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== valor
  ) {
    return null;
  }

  return fecha;
}

function fechaFormulario(valor: unknown): string {
  if (!valor) return "";

  if (valor instanceof Date) {
    return valor.toISOString().slice(0, 10);
  }

  const textoFecha = String(valor);

  if (/^\d{4}-\d{2}-\d{2}/.test(textoFecha)) {
    return textoFecha.slice(0, 10);
  }

  return "";
}

function volver(estado: string): never {
  revalidatePath(RUTA);
  redirect(`${RUTA}?${estado.includes("=") ? estado : `resultado=${estado}`}`);
}

async function comprobarSesion() {
  const sesion = await getSession();

  if (!sesion) {
    redirect("/");
  }

  return sesion;
}

export async function getOpcionesDocenteCurso() {
  await comprobarSesion();

  const [docentes, cursos, horarios] = await Promise.all([
    prisma.$queryRaw<OpcionDocenteCurso[]>`
      SELECT
        COD_DOCENTE AS codigo,
        NOM_DOCENTE AS nombre
      FROM dbo.T_PROFESOR
      WHERE EST_DOCENTE = 'A'
      ORDER BY NOM_DOCENTE
    `,
    prisma.$queryRaw<OpcionDocenteCurso[]>`
    SELECT
        v.IDCURSO AS codigo,
        CONCAT(
        v.DES_CARRERA, ' / ',
        v.DES_MODULO, ' / ',
        v.DES_ASIGNATURA
        ) AS nombre
    FROM dbo.V_CURSOS_NIVELES v
    WHERE EXISTS (
        SELECT 1
        FROM dbo.CURSOS_NIVELES cn
        WHERE cn.IDCURSO = v.IDCURSO
        AND cn.ESTADO = 'A'
    )
    ORDER BY v.DES_CARRERA, v.DES_MODULO, v.DES_ASIGNATURA
    `,
    prisma.$queryRaw<OpcionDocenteCurso[]>`
    SELECT
        COD_HORARIO AS codigo,
        CONCAT(DES_HORARIO, ' - ', DESCRIPCION) AS nombre
    FROM dbo.T_HORARIO
    WHERE ESTADO = 'A'
    ORDER BY DES_HORARIO
    `,
  ]);

  return { docentes, cursos, horarios };
}


export async function getDocentesCurso(
  buscar = "",
  pagina = 1,
  porPagina = 25
): Promise<ResultadoDocenteCurso> {
  await comprobarSesion();

  const filtro = buscar.trim().slice(0, 200);

  const paginaSolicitada = Number.isFinite(pagina)
    ? Math.max(1, Math.floor(pagina))
    : 1;

  const limite = Number.isFinite(porPagina)
    ? Math.min(100, Math.max(1, Math.floor(porPagina)))
    : 25;

  const conteo = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT_BIG(*) AS total
    FROM dbo.V_DOCENTE_CURSO
    WHERE
      ${filtro} = ''
      OR COALESCE(CAST(IDOPERA AS VARCHAR(20)), '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(NOM_DOCENTE, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(DES_CARRERA, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(DES_MODULO, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(DES_ASIGNATURA, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(CAST(IDCURSO AS VARCHAR(50)), '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(DESCRIPCION, '') LIKE '%' + ${filtro} + '%'
  `;

  const total = Number(conteo[0]?.total ?? 0);
  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  const paginaValida = Math.min(
    paginaSolicitada,
    totalPaginas
  );

  const offset = (paginaValida - 1) * limite;

  
  const filas = await prisma.$queryRaw<
    {
      codigo: string | number;
      codigoDocente: string;
      codigoHorario: string;
      idCurso: string | number;
      carrera: string | null;
      modulo: string | null;
      asignatura: string | null;
      docente: string | null;
      horario: string | null;
      desde: Date | string | null;
      hasta: Date | string | null;
      estado: string | null;
    }[]
  >`
    SELECT
      CAST(v.IDOPERA AS VARCHAR(20)) AS codigo,
      v.COD_DOCENTE AS codigoDocente,
      v.COD_HORARIO AS codigoHorario,
      CAST(v.IDCURSO AS VARCHAR(50)) AS idCurso,
      v.DES_CARRERA AS carrera,
      v.DES_MODULO AS modulo,
      v.DES_ASIGNATURA AS asignatura,
      v.NOM_DOCENTE AS docente,
      v.DESCRIPCION AS horario,
      v.DESDE AS desde,
      v.HASTA AS hasta,
      v.ESTADO AS estado
    FROM dbo.V_DOCENTE_CURSO v
    WHERE
      ${filtro} = ''
      OR COALESCE(CAST(v.IDOPERA AS VARCHAR(20)), '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(v.NOM_DOCENTE, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(v.DES_CARRERA, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(v.DES_MODULO, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(v.DES_ASIGNATURA, '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(CAST(v.IDCURSO AS VARCHAR(50)), '') LIKE '%' + ${filtro} + '%'
      OR COALESCE(v.DESCRIPCION, '') LIKE '%' + ${filtro} + '%'
    ORDER BY v.IDOPERA
    OFFSET ${offset} ROWS
    FETCH NEXT ${limite} ROWS ONLY
  `;


  return {
    asignaciones: filas.map((fila) => ({
      codigo: String(fila.codigo ?? ""),
      codigoDocente: String(fila.codigoDocente ?? ""),
      codigoHorario: String(fila.codigoHorario ?? ""),
      idCurso: String(fila.idCurso ?? ""),
      carrera: String(fila.carrera ?? ""),
      modulo: String(fila.modulo ?? ""),
      asignatura: String(fila.asignatura ?? ""),
      docente: String(fila.docente ?? ""),
      horario: String(fila.horario ?? ""),
      desde: fechaFormulario(fila.desde),
      hasta: fechaFormulario(fila.hasta),
      estado: String(fila.estado ?? ""),
    })),
    total,
    pagina: paginaValida,
  };
}


export async function crearDocenteCurso(formData: FormData) {
  await comprobarSesion();

  const docente = texto(formData, "docente");
  const curso = texto(formData, "curso");
  const horario = texto(formData, "horario");
  const desdeTexto = texto(formData, "desde");
  const hastaTexto = texto(formData, "hasta");
  const estado = texto(formData, "estado") || "A";

  const desde = fechaSQL(desdeTexto);
  const hasta = fechaSQL(hastaTexto);

  if (!docente || !curso || !horario || !desde || !hasta) {
    volver("error=campos_obligatorios");
  }

  if (hasta < desde) {
    volver("error=fechas_invalidas");
  }

  if (estado !== "A" && estado !== "I") {
    volver("error=estado_invalido");
  }

  let resultado: RespuestaProcedimiento[];

  try {
    resultado = await prisma.$queryRaw<RespuestaProcedimiento[]>`
      EXEC dbo.SP_DOCENTE_CURSO_NUEVO
        ${docente},
        ${curso},
        ${horario},
        ${desde},
        ${hasta},
        ${estado}
    `;
  } catch (error) {
    console.error("Error al crear la asignación docente-curso:", error);
    volver("error=no_se_pudo_crear");
  }

  const respuesta = resultado[0];

  if (Number(respuesta?.ESTADO) !== 1) {
    const mensaje = respuesta?.MENSAJE || "No se pudo crear la asignación.";
    volver(`error=${encodeURIComponent(mensaje)}`);
  }

  volver("creado");
}

export async function actualizarDocenteCurso(formData: FormData) {
  await comprobarSesion();

  const codigo = texto(formData, "codigo");
  const docente = texto(formData, "docente");
  const curso = texto(formData, "curso");
  const horario = texto(formData, "horario");
  const desdeTexto = texto(formData, "desde");
  const hastaTexto = texto(formData, "hasta");
  const estado = texto(formData, "estado");

  const desde = fechaSQL(desdeTexto);
  const hasta = fechaSQL(hastaTexto);

  if (!codigo || !docente || !curso || !horario || !desde || !hasta) {
    volver("error=campos_obligatorios");
  }

  if (hasta < desde) {
    volver("error=fechas_invalidas");
  }

  if (estado !== "A" && estado !== "I") {
    volver("error=estado_invalido");
  }

  let resultado: RespuestaProcedimiento[];

  try {
    resultado = await prisma.$queryRaw<RespuestaProcedimiento[]>`
      EXEC dbo.SP_DOCENTE_CURSO_MODIFICA
        ${codigo},
        ${docente},
        ${curso},
        ${horario},
        ${desde},
        ${hasta},
        ${estado}
    `;
  } catch (error) {
    console.error("Error al actualizar la asignación docente-curso:", error);
    volver("error=no_se_pudo_actualizar");
  }

  const respuesta = resultado[0];

  if (Number(respuesta?.ESTADO) !== 1) {
    const mensaje = respuesta?.MENSAJE || "No se pudo actualizar la asignación.";
    volver(`error=${encodeURIComponent(mensaje)}`);
  }

  volver("actualizado");
}

export async function eliminarDocenteCurso(formData: FormData) {
  await comprobarSesion();

  const codigo = texto(formData, "codigo");

  if (!codigo) {
    volver("error=codigo_invalido");
  }

  let resultado: RespuestaProcedimiento[];

  try {
    resultado = await prisma.$queryRaw<RespuestaProcedimiento[]>`
      EXEC dbo.SP_DOCENTE_CURSO_ELIMINA ${codigo}
    `;
  } catch (error) {
    console.error("Error al eliminar la asignación docente-curso:", error);
    volver("error=no_se_pudo_eliminar");
  }

  const respuesta = resultado[0];

  if (Number(respuesta?.ESTADO) !== 1) {
    const mensaje = respuesta?.MENSAJE || "No se pudo eliminar la asignación.";
    volver(`error=${encodeURIComponent(mensaje)}`);
  }

  volver("eliminado");
}