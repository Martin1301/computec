
import { getMenuEstructural } from "@/app/actions/menu";
import SidebarClient from "@/components/SidebarClient";

export default async function Sidebar({
  nombreUsuario,
}: {
  nombreUsuario: string;
}) {
  const menuEstructural = await getMenuEstructural();

  return (
    <SidebarClient
      nombreUsuario={nombreUsuario}
      menuEstructural={menuEstructural}
    />
  );
}
