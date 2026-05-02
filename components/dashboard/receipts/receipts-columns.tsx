"use client";

import { useMemo } from "react";
import { ListReceipt, Store as StoreType } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Store as StoreIcon, Calendar, Tag } from "lucide-react";

export const getReceiptsColumns = (
  onRowClick: (id: string) => void,
  stores: StoreType[],
): ColumnDef<ListReceipt>[] => [
  {
    id: "receiptNumber",
    accessorKey: "receiptNumber",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Receipt Number"
        label="Receipt Number"
      />
    ),
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Button
          variant="link"
          className="h-auto p-0 font-medium"
          onClick={() => onRowClick(id)}
        >
          {row.getValue("receiptNumber")}
        </Button>
      );
    },
    meta: {
      label: "Receipt Number",
      placeholder: "Search receipt...",
      variant: "text",
    },
    enableColumnFilter: true,
  },
  {
    id: "date",
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" label="Date" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {format(new Date(row.getValue("date")), "MMM d, yyyy HH:mm")}
        </span>
      );
    },
    meta: {
      label: "Date",
      variant: "dateRange",
      icon: Calendar,
    },
    enableColumnFilter: true,
  },
  {
    id: "storeId",
    accessorFn: (row) => row.store.id,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Store" label="Store" />
    ),
    cell: ({ row }) => <div>{row.original.store.name}</div>,
    meta: {
      label: "Store",
      variant: "select",
      icon: StoreIcon,
      options: stores.map((store) => ({
        label: store.name,
        value: store.id,
      })),
    },
    enableColumnFilter: true,
  },
  {
    id: "customer",
    accessorFn: (row) => row.customer?.name ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Customer"
        label="Customer"
      />
    ),
    cell: ({ row }) => {
      const c = row.original.customer;
      if (!c?.name && !c?.phone) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="leading-tight">
          <div className="font-medium">{c?.name ?? "—"}</div>
          {c?.phone ? (
            <div className="text-xs text-muted-foreground">{c.phone}</div>
          ) : null}
        </div>
      );
    },
    meta: {
      label: "Customer",
      variant: "text",
    },
    enableColumnFilter: false,
  },
  {
    id: "total",
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Amount"
        label="Total Amount"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const currency = row.original.currency;

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
    meta: {
      label: "Amount",
      variant: "number",
    },
    enableColumnFilter: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" label="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "issued"
              ? "default"
              : status === "returned"
                ? "destructive"
                : "secondary"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "select",
      icon: Tag,
      options: [
        { label: "Issued", value: "issued" },
        { label: "Returned", value: "returned" },
        { label: "Voided", value: "voided" },
      ],
    },
    enableColumnFilter: true,
  },
];
