"use server"

import { prisma } from "@/lib/db"
import { connection } from "next/server"

// (Mantén tus imports de prisma y connection arriba)

// Función para obtener los datos actuales de un solo alumno
export async function getAlumnoByCodigo(codigo: string) {
  await connection()
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
  await connection()
  
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


export async function getAlumnos() {
  try {
    // Asegura el renderizado en tiempo de petición para Next.js v16
    await connection() 

    // LLAMADA CORRECTA: 't' minúscula combinada con 'ALUMNOS' en mayúscula
    const alumnos = await prisma.t_ALUMNOS.findMany({
      take: 20, 
      select: {
        CODALUMNO: true,
        APELLIDO_PAT: true,
        APELLIDO_MAT: true,
        NOMBRES: true,
        EMAIL: true,
        ESTADO: true,
      }
    })
    return alumnos
  } catch (error) {
    console.error("Error real de SQL Server:", error)
    throw new Error("No se pudieron cargar los alumnos")
  }
}

// (Mantén las funciones de getAlumnos, getAlumnoByCodigo y updateAlumno que ya creamos)

// Función para INSERTAR un nuevo alumno en SQL Server
export async function createAlumno(formData: FormData) {
  await connection() // Forzar ruta dinámica para Next.js v16+

  // Extraemos rigurosamente TODOS los campos obligatorios y opcionales de tu modelo
  const codAlumno = formData.get("codAlumno")?.toString().trim()
  const apellidoPat = formData.get("apellidoPat")?.toString().trim()
  const apellidoMat = formData.get("apellidoMat")?.toString().trim()
  const nombres = formData.get("nombres")?.toString().trim()
  const fechaNacStr = formData.get("fechaNac")?.toString()
  const sexo = formData.get("sexo")?.toString()
  const domicilio = formData.get("domicilio")?.toString().trim()
  const codLocal = formData.get("codLocal")?.toString() || "01" // Valor por defecto común si aplica
  const telefono = formData.get("telefono")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const codigoAsist = formData.get("codigoAsist")?.toString().trim() || "ASIST"
  const estado = formData.get("estado")?.toString() || "A"

  // 1. Validación de seguridad en el servidor: Campos NOT NULL obligatorios
  if (!codAlumno || !apellidoPat || !apellidoMat || !nombres || !fechaNacStr || !sexo || !codLocal || !codigoAsist) {
    return { error: "Por favor, complete todos los campos obligatorios del registro." }
  }

  // 2. Formateamos la fecha correctamente para el tipo DateTime de SQL Server 2014
  const fechaNac = new Date(fechaNacStr)

  // 3. Procesamos el campo concatenado NOMUNIDO de forma automática para no omitirlo
  const nomUnido = `${apellidoPat} ${apellidoMat} ${nombres}`.toUpperCase()

  try {
    // Verificamos primero que el código no esté duplicado en el archivo .mdf
    const existe = await prisma.t_ALUMNOS.findUnique({
      where: { CODALUMNO: codAlumno }
    })

    if (existe) {
      return { error: `El código de alumno [${codAlumno}] ya se encuentra registrado.` }
    }

    // Insertamos el registro completo respetando el 100% de la estructura de tu BD
    await prisma.t_ALUMNOS.create({
      data: {
        CODALUMNO: codAlumno,
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
        NOMUNIDO: nomUnido
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Error crítico al insertar alumno en SQL Server:", error)
    return { error: "No se pudo guardar el registro del alumno en la base de datos." }
  }
}

