"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { GalleryVerticalEnd } from "lucide-react";
import { TeamSwitcher } from "./team-switcher";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Receipts",
      url: "/dashboard/receipts",
      icon: IconFileDescription,
    },
    {
      title: "Returns",
      url: "/dashboard/returns",
      icon: IconListDetails,
    },
    {
      title: "Stores",
      url: "/dashboard/stores",
      icon: IconFolder,
    },
    {
      title: "Customers",
      url: "#",
      icon: IconUsers,
    },
    // {
    //   title: "Analytics",
    //   url: "#",
    //   icon: IconChartBar,
    // },
  ],
  navClouds: [
    {
      title: "Issue Receipt",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "New Receipt",
          url: "#",
        },
        {
          title: "Bulk Issue",
          url: "#",
        },
      ],
    },
    {
      title: "Process Return",
      icon: IconReport,
      url: "#",
      items: [
        {
          title: "Pending Returns",
          url: "#",
        },
        {
          title: "Return History",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Fraud Detection",
          url: "#",
        },
        {
          title: "Revenue Reports",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: IconSettings,
    // },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: IconSearch,
    // },
  ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: IconReport,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: IconFileWord,
  //   },
  // ],
  teams: [
    {
      name: "SafeReceipts",
      logo: GalleryVerticalEnd,
      plan: "Free",
    },
  ],
};

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" session={session} {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} isAuthenticated={!!session?.user} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {session?.user ? <NavUser user={session.user} /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}
