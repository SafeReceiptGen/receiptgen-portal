"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Receipt } from "@/types/retailers";

interface SearchFilterProps {
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
  onClear: () => void;
  receipts: Receipt[];
}

export function ReceiptSearchFilter({
  onSearchChange,
  onStatusChange,
  onClear,
  receipts,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [hasFilters, setHasFilters] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearchChange(value);
      setHasFilters(!!value || !!statusFilter);
    },
    [statusFilter, onSearchChange]
  );

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onStatusChange(value);
    setHasFilters(!!searchQuery || !!value);
  };

  const handleClear = () => {
    setSearchQuery("");
    setStatusFilter("");
    setHasFilters(false);
    onClear();
  };

  const uniqueStatuses = Array.from(
    new Set(receipts.map((r) => r.status))
  ) as Receipt["status"][];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Receipt ID, Phone, Item, or Customer..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "pending_return"
                  ? "Pending Return"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
