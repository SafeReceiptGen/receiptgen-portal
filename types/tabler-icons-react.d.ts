/**
 * @tabler/icons-react ships CJS without bundled .d.ts files.
 * Declares the `Icon` type and every icon imported in this repo.
 */
declare module "@tabler/icons-react" {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

  export type Icon = ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & RefAttributes<SVGSVGElement>
  >;

  export const IconCamera: Icon;
  export const IconChartBar: Icon;
  export const IconChevronDown: Icon;
  export const IconChevronLeft: Icon;
  export const IconChevronRight: Icon;
  export const IconChevronsLeft: Icon;
  export const IconChevronsRight: Icon;
  export const IconCircleCheckFilled: Icon;
  export const IconCreditCard: Icon;
  export const IconDashboard: Icon;
  export const IconDatabase: Icon;
  export const IconDots: Icon;
  export const IconDotsVertical: Icon;
  export const IconFileAi: Icon;
  export const IconFileDescription: Icon;
  export const IconFileWord: Icon;
  export const IconFolder: Icon;
  export const IconGripVertical: Icon;
  export const IconHelp: Icon;
  export const IconLayoutColumns: Icon;
  export const IconListDetails: Icon;
  export const IconLoader: Icon;
  export const IconLogout: Icon;
  export const IconNotification: Icon;
  export const IconPlus: Icon;
  export const IconReport: Icon;
  export const IconSearch: Icon;
  export const IconSettings: Icon;
  export const IconShare3: Icon;
  export const IconTrash: Icon;
  export const IconTrendingDown: Icon;
  export const IconTrendingUp: Icon;
  export const IconUserCircle: Icon;
  export const IconUsers: Icon;
}
