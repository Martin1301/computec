"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cerrarSesion } from "@/app/actions/auth";
import type { Menu } from "@/app/actions/menu";

export default function SidebarClient({
  nombreUsuario,
  nivelUsuario,
  menuEstructural,
}: {
  nombreUsuario: string;
  nivelUsuario: string | null;
  menuEstructural: Menu[];
}) {
  const pathname = usePathname();

  const [contraido, setContraido] = useState(false);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState<string[]>(
    menuEstructural.map((menu) => menu.cod_menu)
  );

  function alternarSeccion(id: string) {
    setSeccionesAbiertas((actuales) =>
      actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales, id]
    );
  }

  function esRutaActiva(ruta: string) {
    return pathname === ruta || pathname.startsWith(`${ruta}/`);
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-[width] duration-300 ${
        contraido ? "w-20" : "w-64"
      }`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
        <div
          className={`mb-5 flex items-center border-b border-slate-800 pb-4 ${
            contraido
              ? "flex-col gap-3"
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

              <span className="mt-2 inline-flex rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                {nivelUsuario ?? "USUARIO"}
              </span>
            </div>
          )}

          {contraido && (
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-sm font-black tracking-wider text-white"
                title="COMPUTEC"
              >
                CT
              </span>
              <span
                className="text-[9px] font-bold text-blue-400"
                title={nivelUsuario ?? "USUARIO"}
              >
                {nivelUsuario === "ADMINISTRADOR" ? "ADM" : "USR"}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setContraido((actual) => !actual)}
            aria-label={contraido ? "Expandir menú" : "Contraer menú"}
            title={contraido ? "Expandir menú" : "Contraer menú"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {contraido ? "☰" : "◀"}
          </button>
        </div>

        <nav aria-label="Navegación principal" className="space-y-5">
          {menuEstructural.map((menu) => {
            const abierto = seccionesAbiertas.includes(menu.cod_menu);

            const contieneRutaActiva = menu.submodulos.some((sub) =>
              esRutaActiva(sub.ruta)
            );

            return (
              <section key={menu.cod_menu} className="space-y-1">
                {!contraido && (
                  <button
                    type="button"
                    onClick={() => alternarSeccion(menu.cod_menu)}
                    aria-expanded={abierto}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-slate-900 ${
                      contieneRutaActiva
                        ? "text-blue-400"
                        : "text-slate-500"
                    }`}
                  >
                    <span>{menu.des_menu}</span>
                    <span className="text-xs">
                      {abierto ? "⌄" : "›"}
                    </span>
                  </button>
                )}

                {(contraido || abierto) && (
                  <div className="space-y-1">
                    {menu.submodulos.map((sub) => {
                      const activo = esRutaActiva(sub.ruta);

                      return (
                        <Link
                          key={sub.cod_submenu}
                          href={sub.ruta}
                          title={sub.des_submenu}
                          aria-label={sub.des_submenu}
                          aria-current={activo ? "page" : undefined}
                          className={`group flex min-h-10 items-center rounded-lg py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            contraido
                              ? "justify-center px-1"
                              : "gap-3 px-3"
                          } ${
                            activo
                              ? "border border-blue-500/20 bg-blue-500/15 text-blue-300 shadow-sm"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-base ${
                              activo
                                ? "text-blue-300"
                                : "text-slate-400 group-hover:text-white"
                            }`}
                          >
                            {sub.icono}
                          </span>

                          {!contraido && (
                            <span className="truncate">
                              {sub.des_submenu}
                            </span>
                          )}

                          {!contraido && activo && (
                            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </nav>
      </div>

      <div
        className={`shrink-0 border-t border-slate-800 p-3 ${
          contraido ? "flex justify-center" : ""
        }`}
      >
        <form action={cerrarSesion}>
          <button
            type="submit"
            title="Cerrar sesión del sistema"
            aria-label="Cerrar sesión del sistema"
            className={`flex min-h-10 items-center rounded-lg py-2 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              contraido
                ? "justify-center px-3"
                : "w-full gap-3 px-3"
            }`}
          >
            <span aria-hidden="true">⇥</span>
            {!contraido && <span>Cerrar sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
