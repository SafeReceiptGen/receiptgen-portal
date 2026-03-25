"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Receipt } from "@/types/retailers";
import { ReceiptStatusBadge } from "./status-badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReceiptsTableProps {
  receipts: Receipt[];
  searchQuery: string;
  statusFilter: string;
}

export function ReceiptsTable({
  receipts,
  searchQuery,
  statusFilter,
}: ReceiptsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: "purchasedAt" | "total" | "status";
    direction: "asc" | "desc";
  }>({ key: "purchasedAt", direction: "desc" });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredAndSortedReceipts = useMemo(() => {
    let filtered = receipts;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (receipt) =>
          receipt.receiptNumber.toLowerCase().includes(query) ||
          receipt.customerName.toLowerCase().includes(query) ||
          receipt.customerPhone?.toLowerCase().includes(query) ||
          receipt.items.some((item) =>
            item.name.toLowerCase().includes(query)
          )
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((receipt) => receipt.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];

      if (sortConfig.key === "purchasedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortConfig.direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [receipts, searchQuery, statusFilter, sortConfig]);

  const toggleSort = (key: "purchasedAt" | "total" | "status") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const toggleRowExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const SortIcon = ({ isActive, direction }: { isActive: boolean; direction?: "asc" | "desc" }) => {
    if (!isActive) return <ChevronDown className="h-4 w-4 opacity-30 ml-1" />;
    return direction === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  if (filteredAndSortedReceipts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No receipts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10"></TableHead>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50">
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("purchasedAt")}
                  >
                    Date
                    <SortIcon
                      isActive={sortConfig.key === "purchasedAt"}
                      direction={sortConfig.direction}
                    />
                  </button>
                </TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50">
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("total")}
                  >
                    Amount
                    <SortIcon
                      isActive={sortConfig.key === "total"}
                      direction={sortConfig.direction}
                    />
                  </button>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50">
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("status")}
                  >
                    Status
                    <SortIcon
                      isActive={sortConfig.key === "status"}
                      direction={sortConfig.direction}
                    />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedReceipts.map((receipt) => (
                <ReceiptTableRow
                  key={receipt.id}
                  receipt={receipt}
                  isExpanded={expandedRows.has(receipt.id)}
                  onToggleExpand={() => toggleRowExpand(receipt.id)}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <p className="text-sm text-muted-foreground">
        Showing {filteredAndSortedReceipts.length} of {receipts.length} receipts
      </p>
    </div>
  );
}

function ReceiptTableRow({
  receipt,
  isExpanded,
  onToggleExpand,
}: {
  receipt: Receipt;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const formattedDate = new Date(receipt.purchasedAt).toLocaleDateString(
    "en-US",
    {
      year: "2-digit",
      month: "short",
      day: "numeric",
    }
  );

  const mainItem = receipt.items[0];

  return (
    <>
      <TableRow className="hover:bg-muted/30">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="p-0 h-6 w-6"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium text-sm">{receipt.receiptNumber}</TableCell>
        <TableCell className="text-sm">{receipt.customerName}</TableCell>
        <TableCell className="text-sm text-muted-foreground">{formattedDate}</TableCell>
        <TableCell className="text-sm max-w-xs truncate">
          {mainItem.name}
        </TableCell>
        <TableCell className="font-semibold">
          {receipt.currency} {receipt.total.toFixed(2)}
        </TableCell>
        <TableCell>
          <ReceiptStatusBadge status={receipt.status} />
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-muted/20">
          <TableCell colSpan={7}>
            <ReceiptDetailView receipt={receipt} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ReceiptDetailView({ receipt }: { receipt: Receipt }) {
  return (
    <div className="py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-sm mb-3">Receipt Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt #:</span>
              <span className="font-medium">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>
                {new Date(receipt.purchasedAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span>{receipt.paymentMethod}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-3">Customer Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{receipt.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{receipt.customerPhone || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Returnable:</span>
              <Badge variant={receipt.isReturnable ? "default" : "secondary"}>
                {receipt.isReturnable ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">Items Purchased</h3>
        <div className="space-y-2">
          {receipt.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start p-3 bg-background rounded-lg border"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">
                  {receipt.currency} {(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  x {item.quantity} @ {receipt.currency} {item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center font-semibold">
          <span>Total Amount:</span>
          <span className="text-lg">
            {receipt.currency} {receipt.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
