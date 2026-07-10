"use client";

import { useState } from "react";
import { ChevronsUpDown, Plus, Search } from "lucide-react";
import { SavedProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
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

interface CatalogProductPickerProps {
  products: SavedProduct[];
  currency: string;
  isLoading?: boolean;
  onSelect: (product: SavedProduct) => void;
  className?: string;
}

interface CatalogProductCommandProps {
  products: SavedProduct[];
  currency: string;
  onSelect: (product: SavedProduct) => void;
  listClassName?: string;
}

function CatalogPickerTrigger({
  open,
  className,
  onClick,
}: {
  open: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-label="Search catalog products"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none transition-colors hover:border-blue-400 hover:bg-white focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:border-blue-400/60 dark:hover:bg-white/8 dark:focus-visible:ring-blue-400/20",
        className,
      )}
    >
      <Search size={14} className="shrink-0 text-slate-400 dark:text-white/35" />
      <span className="truncate">Add from catalog…</span>
      <ChevronsUpDown
        size={14}
        className="ml-auto shrink-0 text-slate-400 dark:text-white/35"
      />
    </button>
  );
}

function CatalogProductCommand({
  products,
  currency,
  onSelect,
  listClassName,
}: CatalogProductCommandProps) {
  return (
    <Command shouldFilter className="flex min-h-0 flex-1 flex-col">
      <CommandInput placeholder="Search catalog…" />
      <CommandList className={cn("max-h-[300px]", listClassName)}>
        <CommandEmpty>No products found.</CommandEmpty>
        <CommandGroup>
          {products.map((product) => {
            const price = product.defaultPrice
              ? parseFloat(product.defaultPrice)
              : null;
            const searchValue = [product.name, product.description ?? ""]
              .filter(Boolean)
              .join(" ");

            return (
              <CommandItem
                key={product.id}
                value={searchValue}
                onSelect={() => onSelect(product)}
                className="flex items-start gap-2 py-2.5"
              >
                <Plus
                  size={14}
                  className="mt-0.5 shrink-0 text-slate-400 dark:text-white/35"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-white/45">
                    {product.description?.trim()
                      ? product.description
                      : "No description"}
                    {price !== null && !Number.isNaN(price)
                      ? ` · ${formatCurrency(price, currency)}`
                      : ""}
                  </p>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function CatalogProductPicker({
  products,
  currency,
  isLoading = false,
  onSelect,
  className,
}: CatalogProductPickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div
        className={cn(
          "h-9 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-white/8",
          className,
        )}
      />
    );
  }

  if (products.length === 0) {
    return null;
  }

  const handleSelect = (product: SavedProduct) => {
    onSelect(product);
    setOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <CatalogPickerTrigger
          open={open}
          className={className}
          onClick={() => setOpen(true)}
        />
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="z-[100] flex max-h-[85vh] flex-col bg-white dark:bg-[#061124]">
            <DrawerHeader className="pb-2 text-left">
              <DrawerTitle className="text-slate-900 dark:text-white">
                Add from catalog
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
              <CatalogProductCommand
                products={products}
                currency={currency}
                onSelect={handleSelect}
                listClassName="max-h-none min-h-0 flex-1 overflow-y-auto overscroll-contain"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <CatalogPickerTrigger open={open} className={className} />
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <CatalogProductCommand
          products={products}
          currency={currency}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
