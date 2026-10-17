import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getFreshServerSession } from "@/lib/get-server-session";

async function layout({ children }: { children: React.ReactNode }) {
  const session = await getFreshServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.retailerId) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" session={session} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default layout;
