
"use client";

import Link from "next/link";
import { useState } from "react";
import { cerrarSesion } from "@/app/actions/auth";

type Submodulo = {
  cod_submenu: number;
  des_submenu: string;
};

type Menu = {
  cod_menu: number;
  des_menu: string;
  submodulos: Submodulo[];
};

export default function SidebarClient({
  nombreUsuario,
  menuEstructural,
}: {
  nombreUsuario: string;
  menuEstructural: Menu[];
}) {
  const [contraido, setContraido] = useState(false);

  function obtenerRuta(nombre: string) {
    const modulo = nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

    // La asignación de docentes a cursos debe evaluarse primero.
    if (
      modulo.includes("DOCENTE") &&
      (modulo.includes("CURSO") || modulo.includes("ASIGN"))
    ) {
      return "/docente-curso";
    }

    if (
      modulo.includes("ORGANIZA") ||
      modulo.includes("ORGANIZAR CURSOS")
    ) {
      return "/organizacion-cursos";
    }

    if (modulo.includes("ALUMNO")) return "/alumnos";

    if (
      modulo.includes("NOTA") ||
      modulo.includes("CALIFICACION")
    ) {
      return "/alumnos";
    }

    if (
      modulo.includes("PROFESOR") ||
      modulo.includes("DOCENTE")
    ) {
      return "/profesores";
    }

    if (modulo.includes("ASIGNATURA")) return "/asignaturas";
    if (modulo.includes("MATRICULA")) return "/matriculas";
    if (modulo.includes("HORARIO")) return "/horarios";
    if (modulo.includes("CURSO")) return "/matriculas";
    if (modulo.includes("CARRERA")) return "/carreras";
    if (modulo.includes("MODULO")) return "/modulos";

    return "/alumnos";
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-950 p-3 text-slate-200 transition-[width] duration-300 ${
        contraido ? "w-20" : "w-64"
      }`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div
          className={`mb-6 flex items-center border-b border-slate-800 pb-4 ${
            contraido
              ? "flex-col gap-3 px-0"
              : "justify-between gap-2 px-2"
          }`}
        >
          {!contraido && (
            <div className="min-w-0">
              <h2 className="text-xl font-black tracking-wider text-white">
                COMPUTEC
              </h2>

              <p className="text-xs font-semibold tracking-wide text-blue-400">
                Gestión académica
              </p>

              <p
                className="mt-2 truncate text-xs text-slate-400"
                title={nombreUsuario}
              >
                {nombreUsuario}
              </p>
            </div>
          )}

          {contraido && (
            <span
              className="text-sm font-black tracking-wider text-white"
              title="COMPUTEC"
            >
              CT
            </span>
          )}

          <button
            type="button"
            onClick={() => setContraido(!contraido)}
            aria-label={
              contraido ? "Expandir menú" : "Contraer menú"
            }
            title={contraido ? "Expandir menú" : "Contraer menú"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {contraido ? "☰" : "◀"}
          </button>
        </div>

        <nav className="space-y-6">
          {menuEstructural.map((menu) => (
            <div key={menu.cod_menu} className="space-y-2">
              {!contraido && (
                <div className="px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {menu.des_menu}
                </div>
              )}

              <div className="space-y-1">
                {menu.submodulos.map((sub) => {
                  const ruta = obtenerRuta(sub.des_submenu);

                  return (
                    <Link
                      key={sub.cod_submenu}
                      href={ruta}
                      title={sub.des_submenu}
                      aria-label={sub.des_submenu}
                      className={`group flex min-h-10 items-center rounded-lg py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        contraido
                          ? "justify-center px-1"
                          : "px-3"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                          contraido ? "" : "mr-3"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 opacity-70 transition-opacity group-hover:opacity-100" />
                      </span>

                      {!contraido && (
                        <span className="truncate">
                          {sub.des_submenu}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div
        className={`mt-3 border-t border-slate-800 pt-4 ${
          contraido ? "flex justify-center px-0" : "px-2"
        }`}
      >
        <form action={cerrarSesion}>
          <button
            type="submit"
            title="Cerrar sesión del sistema"
            aria-label="Cerrar sesión del sistema"
            className={`flex min-h-10 items-center rounded-lg py-2 text-xs font-bold text-rose-400 transition-colors hover:bg-slate-800 hover:text-rose-300 ${
              contraido
                ? "justify-center px-3"
                : "w-full gap-2 px-2"
            }`}
          >
            <span aria-hidden="true">🚪</span>
            {!contraido && <span>Cerrar sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
