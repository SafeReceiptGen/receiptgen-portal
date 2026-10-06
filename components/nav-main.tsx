"use client";

import type { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ReceiptFormScreen from "./form/form-screen";

function activeNavHref(pathname: string, hrefs: string[]) {
  let match: string | null = null;

  for (const href of hrefs) {
    const isMatch = pathname === href || pathname.startsWith(`${href}/`);
    if (!isMatch) continue;
    if (match === null || href.length > match.length) {
      match = href;
    }
  }

  return match;
}

export function NavMain({
  items,
  isAuthenticated = false,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  isAuthenticated?: boolean;
}) {
  const pathname = usePathname();
  const activeHref = activeNavHref(
    pathname,
    items.map((item) => item.url),
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <ReceiptFormScreen isAuthenticated={isAuthenticated} />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url === activeHref;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
