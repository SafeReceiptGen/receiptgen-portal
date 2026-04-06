"use client";

import { useMemo } from "react";
import { ListReceipt } from "@/lib/api";
import { useDataTable } from "@/hooks/use-data-table";
import { getReceiptsColumns } from "./receipts-columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { Loader2 } from "lucide-react";

import { Store } from "@/lib/api";

interface ReceiptsTableProps {
  data: ListReceipt[];
  pageCount: number;
  isLoading?: boolean;
  stores: Store[];
  onRowClick: (id: string) => void;
}

export function ReceiptsTable({
  data,
  pageCount,
  isLoading,
  stores,
  onRowClick,
}: ReceiptsTableProps) {
  const columns = useMemo(() => getReceiptsColumns(onRowClick, stores), [onRowClick, stores]);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    getRowId: (row) => row.id,
    enableAdvancedFilter: true, // Use advanced toolbar
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <DataTableFilterMenu table={table} />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  );
}
