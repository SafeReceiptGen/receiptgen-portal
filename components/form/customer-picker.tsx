"use client";

import { useEffect, useId, useState, type ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Search, X } from "lucide-react";
import type { RetailerCustomer } from "@/lib/api";
import { customersListQueryOptions } from "@/lib/queries/customers";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomerPickerProps {
  selectedCustomerId?: string;
  customerName: string;
  customerPhone: string;
  onSelect: (customer: RetailerCustomer) => void;
  onClear: () => void;
  className?: string;
}

function customerLabel(name: string | null | undefined, phone: string | null | undefined) {
  const trimmedName = name?.trim() || "Unnamed customer";
  const trimmedPhone = phone?.trim();
  return trimmedPhone ? `${trimmedName} · ${trimmedPhone}` : trimmedName;
}

function CustomerPickerTrigger({
  open,
  selected,
  label,
  listId,
  onClear,
  className,
  ...props
}: ComponentProps<"button"> & {
  open: boolean;
  selected: boolean;
  label: string;
  listId: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-label="Select customer"
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm outline-none transition-colors hover:border-blue-400 hover:bg-white focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/60 dark:hover:bg-white/8 dark:focus-visible:ring-blue-400/20",
        selected
          ? "text-slate-900 dark:text-white"
          : "text-slate-500 dark:text-white/50",
        className,
      )}
      {...props}
    >
      <Search size={14} className="shrink-0 text-slate-400 dark:text-white/35" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {selected ? (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Clear selected customer"
          className="text-slate-400 hover:text-slate-700 dark:text-white/35 dark:hover:text-white"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClear();
          }}
        >
          <X size={14} />
        </span>
      ) : (
        <ChevronsUpDown
          size={14}
          className="shrink-0 text-slate-400 dark:text-white/35"
        />
      )}
    </button>
  );
}

function CustomerSearchCommand({
  customers,
  isLoading,
  isError,
  hasSearch,
  draft,
  listId,
  onDraftChange,
  onSelect,
  className,
  listClassName,
}: {
  customers: RetailerCustomer[];
  isLoading: boolean;
  isError: boolean;
  hasSearch: boolean;
  draft: string;
  listId: string;
  onDraftChange: (value: string) => void;
  onSelect: (customer: RetailerCustomer) => void;
  className?: string;
  listClassName?: string;
}) {
  return (
    <Command shouldFilter={false} className={className}>
      <CommandInput
        placeholder="Search by name or phone…"
        value={draft}
        onValueChange={onDraftChange}
      />
      <CommandList id={listId} className={listClassName}>
        {isLoading ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-white/50">
            Searching…
          </p>
        ) : isError ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-white/50">
            Could not load customers.
          </p>
        ) : customers.length === 0 ? (
          <CommandEmpty>
            {hasSearch
              ? "No saved customer. Enter name and phone below — they'll be saved when you issue the receipt."
              : "No saved customers yet. Enter a name and phone below."}
          </CommandEmpty>
        ) : (
          <CommandGroup>
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={customer.id}
                onSelect={() => onSelect(customer)}
                className="flex flex-col items-start gap-0.5 py-2.5"
              >
                <span className="truncate font-medium text-slate-900 dark:text-white">
                  {customer.name?.trim() || "Unnamed customer"}
                </span>
                <span className="truncate text-xs text-slate-500 dark:text-white/45">
                  {customer.phone?.trim() || "No phone"}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}

export function CustomerPicker({
  selectedCustomerId,
  customerName,
  customerPhone,
  onSelect,
  onClear,
  className,
}: CustomerPickerProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(draft.trim()), 300);
    return () => clearTimeout(timer);
  }, [draft]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setDraft("");
      setSearch("");
    }
  };

  const { data, isFetching, isError } = useQuery({
    ...customersListQueryOptions({
      page: 1,
      limit: 8,
      ...(search ? { search } : {}),
    }),
    enabled: open,
  });

  const customers = data?.customers ?? [];
  const selected = Boolean(selectedCustomerId);
  const label = selected
    ? customerLabel(customerName, customerPhone)
    : "Select customer";

  const handleSelect = (customer: RetailerCustomer) => {
    onSelect(customer);
    setOpen(false);
  };

  const command = (
    <CustomerSearchCommand
      customers={customers}
      isLoading={isFetching && customers.length === 0}
      isError={isError}
      hasSearch={Boolean(search)}
      draft={draft}
      listId={listId}
      onDraftChange={setDraft}
      onSelect={handleSelect}
      className={isMobile ? "min-h-0 flex-1" : undefined}
      listClassName={
        isMobile
          ? "max-h-none min-h-0 flex-1 overflow-y-auto overscroll-contain"
          : undefined
      }
    />
  );

  return (
    <div className="space-y-1.5">
      {isMobile ? (
        <>
          <CustomerPickerTrigger
            open={open}
            selected={selected}
            label={label}
            listId={listId}
            onClear={onClear}
            className={className}
            onClick={() => handleOpenChange(true)}
          />
          <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerContent className="z-[100] flex max-h-[85vh] flex-col bg-white dark:bg-[#061124]">
              <DrawerHeader className="pb-2 text-left">
                <DrawerTitle className="text-slate-900 dark:text-white">
                  Select customer
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
                {command}
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <CustomerPickerTrigger
              open={open}
              selected={selected}
              label={label}
              listId={listId}
              onClear={onClear}
              className={className}
            />
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            {command}
          </PopoverContent>
        </Popover>
      )}
      <p className="text-xs text-slate-500 dark:text-white/45">
        {selected
          ? "Editing the name or phone updates this saved customer when you issue the receipt."
          : "Search saved customers, or enter a new name and phone below."}
      </p>
    </div>
  );
}
