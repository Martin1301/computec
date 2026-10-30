"use server";

import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export async function loginSistema(formData: FormData) {
  await connection();

  const dniInput = formData.get("usuario")?.toString().trim();
  const passwordInput = formData.get("password")?.toString();

  if (!dniInput || !passwordInput) {
    return { error: "Por favor, llena todos los campos." };
  }

  try {
    const usuarioValidado = await prisma.t_USUARIO.findFirst({
      where: {
        DNIUSUARIO: dniInput,
        CLAVE: passwordInput,
        ESTADO: "A",
      },
      select: {
        DNIUSUARIO: true,
        NOMBRE: true,
        NIVEL: true,
      },
    });

    if (!usuarioValidado) {
      return {
        error: "El usuario o la contraseña son incorrectos.",
      };
    }

    await createSession({
      dni: usuarioValidado.DNIUSUARIO,
      nombre: usuarioValidado.NOMBRE,
      nivel: usuarioValidado.NIVEL,
    });

    return {
      success: true,
      usuario: usuarioValidado.NOMBRE,
    };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    if (
      error instanceof Error &&
      error.message.includes("APP_SESSION_SECRET")
    ) {
      return {
        error:
          "Falta configurar APP_SESSION_SECRET en .env y reiniciar el servidor.",
      };
    }

    return {
      error:
        "No se pudo iniciar sesión. Verifica la conexión con SQL Server.",
    };
  }
}

export async function cerrarSesion() {
  await destroySession();
  redirect("/");
}