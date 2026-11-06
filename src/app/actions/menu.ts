export type Submodulo = {
  cod_submenu: string;
  des_submenu: string;
  ruta: string;
  icono: string;
};

export type Menu = {
  cod_menu: string;
  des_menu: string;
  icono: string;
  submodulos: Submodulo[];
};

export async function getMenuEstructural(): Promise<Menu[]> {
  return [
    {
      cod_menu: "academico",
      des_menu: "Académico",
      icono: "▦",
      submodulos: [
        {
          cod_submenu: "alumnos",
          des_submenu: "Alumnos",
          ruta: "/alumnos",
          icono: "♟",
        },
        {
          cod_submenu: "carreras",
          des_submenu: "Carreras",
          ruta: "/carreras",
          icono: "▤",
        },
        {
          cod_submenu: "modulos",
          des_submenu: "Módulos",
          ruta: "/modulos",
          icono: "▦",
        },
        {
          cod_submenu: "asignaturas",
          des_submenu: "Asignaturas",
          ruta: "/asignaturas",
          icono: "▧",
        },
      ],
    },
    {
      cod_menu: "organizacion",
      des_menu: "Organización académica",
      icono: "◫",
      submodulos: [
        {
          cod_submenu: "profesores",
          des_submenu: "Profesores",
          ruta: "/profesores",
          icono: "♙",
        },
        {
          cod_submenu: "docente-curso",
          des_submenu: "Docente - Curso",
          ruta: "/docente-curso",
          icono: "⇄",
        },
        {
          cod_submenu: "organizacion-cursos",
          des_submenu: "Organización de cursos",
          ruta: "/organizacion-cursos",
          icono: "▥",
        },
        {
          cod_submenu: "horarios",
          des_submenu: "Horarios",
          ruta: "/horarios",
          icono: "◷",
        },
      ],
    },
    {
      cod_menu: "matriculas",
      des_menu: "Matrículas",
      icono: "▣",
      submodulos: [
        {
          cod_submenu: "gestion-matriculas",
          des_submenu: "Gestión de matrículas",
          ruta: "/matriculas",
          icono: "▣",
        },
      ],
    },
    {
      cod_menu: "evaluacion",
      des_menu: "Evaluación",
      icono: "✓",
      submodulos: [
        {
          cod_submenu: "notas",
          des_submenu: "Notas",
          ruta: "/notas",
          icono: "✓",
        },
      ],
    },
    {
      cod_menu: "asistencia",
      des_menu: "Asistencia",
      icono: "◷",
      submodulos: [
        {
          cod_submenu: "registro-asistencia",
          des_submenu: "Registro de asistencia",
          ruta: "/asistencia",
          icono: "◷",
        },
      ],
    },
  ];
}
