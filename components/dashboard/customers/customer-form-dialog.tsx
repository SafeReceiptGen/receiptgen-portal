"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CustomerFormValues {
  name: string;
  phone: string;
}

function validateCustomerFields(name: string, phone: string): string | null {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  if (!trimmedName) return "Customer name is required";
  if (trimmedName.length > 255) return "Customer name is too long";
  if (trimmedPhone.length < 7) {
    return "Customer phone must be at least 7 characters";
  }
  if (trimmedPhone.length > 30) return "Customer phone is too long";
  return null;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialName = "",
  initialPhone = "",
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialName?: string;
  initialPhone?: string;
  isPending: boolean;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? (
          <CustomerFormFields
            key={`${initialName}\0${initialPhone}`}
            title={title}
            description={description}
            submitLabel={submitLabel}
            initialName={initialName}
            initialPhone={initialPhone}
            isPending={isPending}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CustomerFormFields({
  title,
  description,
  submitLabel,
  initialName,
  initialPhone,
  isPending,
  onCancel,
  onSubmit,
}: {
  title: string;
  description: string;
  submitLabel: string;
  initialName: string;
  initialPhone: string;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const message = validateCustomerFields(name, phone);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    onSubmit({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label htmlFor="customer-name">Name</Label>
        <Input
          id="customer-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ama Mensah"
          autoComplete="name"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customer-phone">Phone</Label>
        <Input
          id="customer-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="e.g. +233 24 444 4444"
          autoComplete="tel"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
