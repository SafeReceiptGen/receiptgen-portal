"use client";

import { Receipt } from "@/types/retailers";
import { ReceiptsTable } from "./receipts-table";
import { ReceiptCards } from "./receipt-cards";

interface ResponsiveReceiptsProps {
  receipts: Receipt[];
  searchQuery: string;
  statusFilter: string;
}

export function ResponsiveReceipts({
  receipts,
  searchQuery,
  statusFilter,
}: ResponsiveReceiptsProps) {
  return (
    <>
      {/* Desktop: Show table */}
      <div className="hidden md:block">
        <ReceiptsTable
          receipts={receipts}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />
      </div>

      {/* Mobile: Show cards */}
      <div className="md:hidden">
        <ReceiptCards
          receipts={receipts.filter((receipt) => {
            let matches = true;

            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              matches =
                receipt.receiptNumber.toLowerCase().includes(query) ||
                receipt.customerName.toLowerCase().includes(query) ||
                receipt.customerPhone?.toLowerCase().includes(query) ||
                receipt.items.some((item) =>
                  item.name.toLowerCase().includes(query)
                );
            }

            if (statusFilter && matches) {
              matches = receipt.status === statusFilter;
            }

            return matches;
          })}
        />
      </div>
    </>
  );
}
