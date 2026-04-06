"use client";

import { useMemo } from "react";
import { ListReceipt } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatPaymentMethodLabel } from "@/lib/receipt-display-labels";
import { Store, Calendar, CreditCard, Tag } from "lucide-react";

export const getReceiptsColumns = (
  onRowClick: (id: string) => void
): ColumnDef<ListReceipt>[] => [
  {
    id: "receiptNumber",
    accessorKey: "receiptNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Receipt Number" label="Receipt Number" />
    ),
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium" 
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
    id: "store",
    accessorFn: (row) => row.store.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Store" label="Store" />
    ),
    cell: ({ row }) => <div>{row.getValue("store")}</div>,
    meta: {
      label: "Store",
      variant: "text",
      icon: Store,
    },
    enableColumnFilter: true,
  },
  {
    id: "total",
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" label="Total Amount" />
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
    id: "paymentMethod",
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" label="Payment" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground capitalize">
        {formatPaymentMethodLabel(row.getValue("paymentMethod"))}
      </span>
    ),
    meta: {
      label: "Payment",
      variant: "select",
      icon: CreditCard,
      options: [
        { label: "Cash", value: "cash" },
        { label: "Card", value: "card" },
        { label: "Mobile Money", value: "mobile_money" },
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "Check", value: "check" },
      ],
    },
    enableColumnFilter: true,
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
            status === "issued" ? "default" : 
            status === "returned" ? "destructive" : "secondary"
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
