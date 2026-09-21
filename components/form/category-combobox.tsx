"use client";

import { useState, type ComponentProps } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import {
  MAX_CATEGORY_LENGTH,
  resolveCategory,
  uniqueCategories,
} from "@/lib/catalog-categories";
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

interface CategoryComboboxProps {
  value: string | null;
  categories: readonly string[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

function CategoryTrigger({
  open,
  selectedCategory,
  placeholder,
  className,
  onClear,
  disabled,
  ...props
}: ComponentProps<"button"> & {
  open: boolean;
  selectedCategory: string | null;
  placeholder: string;
  onClear: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-label="Select or create category"
      disabled={disabled}
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full min-w-0 items-center gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        selectedCategory
          ? "text-foreground"
          : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate text-left">
        {selectedCategory || placeholder}
      </span>
      {selectedCategory ? (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Clear category"
          className="text-muted-foreground hover:text-foreground rounded-sm p-0.5"
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
          <X className="size-3.5" />
        </span>
      ) : (
        <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />
      )}
    </button>
  );
}

function CategoryCommand({
  options,
  value,
  search,
  onSearchChange,
  onSelect,
  className,
  listClassName,
}: {
  options: string[];
  value: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (value: string | null) => void;
  className?: string;
  listClassName?: string;
}) {
  const query = search.trim();
  const queryKey = query.toLowerCase();
  const filtered = queryKey
    ? options.filter((category) => category.toLowerCase().includes(queryKey))
    : options;
  const exactMatch = options.some(
    (category) => category.toLowerCase() === queryKey,
  );
  const canCreate = query.length > 0 && !exactMatch;

  return (
    <Command
      shouldFilter={false}
      className={className}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    >
      <CommandInput
        placeholder="Search or create…"
        value={search}
        onValueChange={(next) =>
          onSearchChange(next.slice(0, MAX_CATEGORY_LENGTH))
        }
      />
      <CommandList className={listClassName}>
        {!canCreate && filtered.length === 0 ? (
          <CommandEmpty>
            {options.length === 0
              ? "Type to create a category"
              : "No categories found."}
          </CommandEmpty>
        ) : null}
        <CommandGroup>
          {filtered.map((category) => {
            const selected =
              value?.toLowerCase() === category.toLowerCase();
            return (
              <CommandItem
                key={category}
                value={category}
                onSelect={() => onSelect(category)}
              >
                <Check
                  className={cn(
                    "size-4",
                    selected ? "opacity-100" : "opacity-0",
                  )}
                />
                {category}
              </CommandItem>
            );
          })}
          {canCreate ? (
            <CommandItem
              value={`create:${query}`}
              onSelect={() => onSelect(resolveCategory(query, options))}
            >
              <Plus className="size-4" />
              Create “{query}”
            </CommandItem>
          ) : null}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function CategoryCombobox({
  value,
  categories,
  onChange,
  placeholder = "Select or create category",
  className,
  id,
  disabled = false,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();
  const options = uniqueCategories([...categories, value]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const handleSelect = (next: string | null) => {
    onChange(next);
    handleOpenChange(false);
  };

  const trigger = (
    <CategoryTrigger
      id={id}
      open={open}
      selectedCategory={value}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      onClear={() => onChange(null)}
      onClick={isMobile ? () => setOpen(true) : undefined}
    />
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="z-[100] flex max-h-[85vh] flex-col">
            <DrawerHeader className="pb-2 text-left">
              <DrawerTitle>Category</DrawerTitle>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
              <CategoryCommand
                options={options}
                value={value}
                search={search}
                onSearchChange={setSearch}
                onSelect={handleSelect}
                className="min-h-0 flex-1"
                listClassName="max-h-none min-h-0 flex-1 overflow-y-auto overscroll-contain"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <CategoryCommand
          options={options}
          value={value}
          search={search}
          onSearchChange={setSearch}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
