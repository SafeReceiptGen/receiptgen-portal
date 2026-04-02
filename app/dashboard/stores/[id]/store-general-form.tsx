"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storesApi, Store } from "@/lib/api";
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function StoreGeneralForm({ store }: { store: Store }) {
  const queryClient = useQueryClient();

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

  function onSubmit(values: FormValues) {
    updateStore(values);
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div>
        <h3 className="text-lg font-medium">General Information</h3>
        <p className="text-sm text-muted-foreground">
          Basic details about this retail location. These will be visible on generated receipts.
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
