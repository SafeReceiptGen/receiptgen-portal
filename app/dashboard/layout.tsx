import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/get-server-session";

async function layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" isAuthenticated={!!session?.user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

export default layout;
