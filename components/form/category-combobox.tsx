"use client";

import { useState, type ComponentProps } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  MAX_CATEGORY_LENGTH,
  normalizeCategory,
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
  popoverClassName?: string;
  popoverAlign?: "start" | "center" | "end";
  popoverContainer?: HTMLElement | null;
  popoverModal?: boolean;
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
  naming,
  customName,
  onCustomNameChange,
  onStartNaming,
  onCancelNaming,
  className,
  listClassName,
}: {
  options: string[];
  value: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (value: string | null) => void;
  naming: boolean;
  customName: string;
  onCustomNameChange: (value: string) => void;
  onStartNaming: () => void;
  onCancelNaming: () => void;
  className?: string;
  listClassName?: string;
}) {
  const query = normalizeCategory(search) ?? "";
  const queryKey = query.toLowerCase();
  const filtered = queryKey
    ? options.filter((category) => category.toLowerCase().includes(queryKey))
    : options;

  const assignCustom = (raw: string) => {
    const resolved = resolveCategory(raw, options);
    if (!resolved) return;
    onSelect(resolved);
  };

  const handleAddOwn = () => {
    if (query) {
      assignCustom(query);
      return;
    }
    onStartNaming();
  };

  return (
    <Command
      shouldFilter={false}
      className={className}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    >
      <CommandInput
        placeholder="Search categories…"
        value={search}
        onValueChange={(next) =>
          onSearchChange(next.slice(0, MAX_CATEGORY_LENGTH))
        }
      />
      <CommandList className={listClassName}>
        {filtered.length === 0 ? (
          <CommandEmpty>No categories found.</CommandEmpty>
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
        </CommandGroup>
      </CommandList>
      <div className="shrink-0 border-t p-1">
        {naming ? (
          <input
            autoFocus
            value={customName}
            maxLength={MAX_CATEGORY_LENGTH}
            placeholder="Category name"
            aria-label="Custom category name"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus-visible:ring-[3px]"
            onChange={(event) =>
              onCustomNameChange(
                event.target.value.slice(0, MAX_CATEGORY_LENGTH),
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onCancelNaming();
                return;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                assignCustom(customName);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm"
            onClick={handleAddOwn}
          >
            + Add your own category
          </button>
        )}
      </div>
    </Command>
  );
}

export function CategoryCombobox({
  value,
  categories,
  onChange,
  placeholder = "Select or create category",
  className,
  popoverClassName,
  popoverAlign = "start",
  popoverContainer,
  popoverModal = false,
  id,
  disabled = false,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [naming, setNaming] = useState(false);
  const [customName, setCustomName] = useState("");
  const isMobile = useIsMobile();
  const options = uniqueCategories([...categories, value]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setNaming(false);
      setCustomName("");
    }
  };

  const handleSearchChange = (next: string) => {
    setSearch(next);
    if (next.trim()) setNaming(false);
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

  if (isMobile && !popoverContainer && !popoverModal) {
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
                onSearchChange={handleSearchChange}
                onSelect={handleSelect}
                naming={naming}
                customName={customName}
                onCustomNameChange={setCustomName}
                onStartNaming={() => setNaming(true)}
                onCancelNaming={() => {
                  setNaming(false);
                  setCustomName("");
                }}
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
    <Popover open={open} onOpenChange={handleOpenChange} modal={popoverModal}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[var(--radix-popover-trigger-width)] p-0",
          popoverClassName,
        )}
        align={popoverAlign}
        collisionPadding={12}
        container={popoverContainer}
      >
        <CategoryCommand
          options={options}
          value={value}
          search={search}
          onSearchChange={handleSearchChange}
          onSelect={handleSelect}
          naming={naming}
          customName={customName}
          onCustomNameChange={setCustomName}
          onStartNaming={() => setNaming(true)}
          onCancelNaming={() => {
            setNaming(false);
            setCustomName("");
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
