"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, BarChart3, RotateCcw, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Retailer } from "@/types/retailers";
import { MOCK_RETAILERS } from "@/lib/mock-data";

interface DashboardSidebarProps {
  selectedRetailerId: string;
  onRetailerChange: (retailerId: string) => void;
}

export function DashboardSidebar({
  selectedRetailerId,
  onRetailerChange,
}: DashboardSidebarProps) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data } = authClient.useSession();

  const selectedRetailer = MOCK_RETAILERS.find((r) => r.id === selectedRetailerId);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              S
            </div>
            <h1 className="text-lg font-bold">SafeReceipt</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                size="sm"
              >
                <span className="truncate text-sm font-medium">
                  {selectedRetailer?.name || "Select store"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {MOCK_RETAILERS.map((retailer) => (
                <DropdownMenuItem
                  key={retailer.id}
                  onClick={() => onRetailerChange(retailer.id)}
                  className={
                    selectedRetailerId === retailer.id ? "bg-accent" : ""
                  }
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{retailer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {retailer.phone}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true}>
                  <a href="#receipts" className="flex gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Receipts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#returns" className="flex gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>Returns Review</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#settings" className="flex gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-3 px-2 py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-bold">
                  {data?.user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {data?.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Retailer</p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
