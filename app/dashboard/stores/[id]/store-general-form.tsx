"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  retailerApi,
  storesApi,
  Store,
  uploadRetailerLogo,
} from "@/lib/api";
import { retailerQueryOptions } from "@/lib/queries/retailer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { BrandLogoImage } from "@/components/receipt/brand-logo-image";

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LOGO_MAX_BYTES = 12 * 1024 * 1024;
const LOGO_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export function StoreGeneralForm({ store }: { store: Store }) {
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: retailer, isLoading: retailerLoading } = useQuery({
    ...retailerQueryOptions,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: store.name,
      phone: store.phone || "",
      address: store.address || "",
    },
  });

  const { mutate: updateStore, isPending } = useMutation({
    mutationFn: (values: FormValues) => storesApi.update(store.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores", store.id] });
      toast.success("Store details updated successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update store details.");
    },
  });

  const { mutate: uploadLogo, isPending: uploadPending } = useMutation({
    mutationFn: async (file: File) => {
      const { url } = await uploadRetailerLogo(file);
      await retailerApi.update({ logoUrl: url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retailer"] });
      toast.success("Brand logo updated.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload logo.");
    },
  });

  const { mutate: removeLogo, isPending: removePending } = useMutation({
    mutationFn: () => retailerApi.update({ logoUrl: "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retailer"] });
      toast.success("Brand logo removed.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove logo.");
    },
  });

  function onSubmit(values: FormValues) {
    updateStore(values);
  }

  function onLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!LOGO_MIMES.has(file.type)) {
      toast.error("Use PNG, JPEG, WebP, or SVG.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      toast.error("Logo must be 12 MB or smaller.");
      return;
    }
    uploadLogo(file);
  }

  const logoBusy = uploadPending || removePending;
  const logoUrl = retailer?.logoUrl?.trim() ?? "";

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="max-w-xl space-y-3 rounded-2xl border border-border bg-card/50 p-5 shadow-sm">
        <div>
          <h3 className="text-lg font-medium">Brand Logo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Used on every receipt across all your stores.
          </p>
        </div>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={onLogoFileChange}
        />

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
            {retailerLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : logoUrl ? (
              <BrandLogoImage
                url={logoUrl}
                alt="Brand logo"
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Building2 className="h-7 w-7 text-muted-foreground/60" />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={logoBusy || retailerLoading}
              onClick={() => logoInputRef.current?.click()}
            >
              {uploadPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                "Upload logo"
              )}
            </Button>
            {logoUrl ? (
              <Button
                type="button"
                variant="outline"
                disabled={logoBusy}
                onClick={() => removeLogo()}
              >
                {removePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Remove"
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">General Information</h3>
        <p className="text-sm text-muted-foreground">
          Basic details about this retail location. These will be visible on
          generated receipts.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Downtown Branch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. +1 234 567 8900" {...field} />
                </FormControl>
                <FormDescription>
                  Optional. The contact number for this specific location.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. 123 Main St, City, Country"
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional. The physical address of this store.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isPending || !form.formState.isDirty}
              className="rounded-full px-8 shadow-sm"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
