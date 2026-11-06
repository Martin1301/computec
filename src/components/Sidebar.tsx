import { getMenuEstructural } from "@/app/actions/menu";
import SidebarClient from "@/components/SidebarClient";

export default async function Sidebar({
  nombreUsuario,
  nivelUsuario,
}: {
  nombreUsuario: string;
  nivelUsuario: string | null;
}) {
  const menuEstructural = await getMenuEstructural();

  return (
    <SidebarClient
      nombreUsuario={nombreUsuario}
      nivelUsuario={nivelUsuario}
      menuEstructural={menuEstructural}
    />
  );
}
