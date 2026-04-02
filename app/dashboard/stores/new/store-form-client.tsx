"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storesApi } from "@/lib/api";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Store, RefreshCcw } from "lucide-react";

const formSchema = z.object({
  // General Info
  name: z.string().min(2, "Store name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().optional(),
  // Return Policy
  returnWindow: z.string().optional(),
  customWindowDays: z.coerce.number().optional(),
  returnCondition: z.string().optional(),
  refundType: z.string().optional(),
}).refine(
  (data) => {
    if (data.returnWindow === "custom" && (!data.customWindowDays || data.customWindowDays < 1)) {
      return false;
    }
    return true;
  },
  {
    message: "Custom window days must be greater than 0 when using custom window.",
    path: ["customWindowDays"],
  }
);

type FormValues = z.infer<typeof formSchema>;

export function StoreFormClient() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      returnWindow: "30_days",
      customWindowDays: undefined,
      returnCondition: "any_condition",
      refundType: "full_refund",
    },
  });

  const watchReturnWindow = form.watch("returnWindow");

  const { mutate: createStore, isPending } = useMutation({
    mutationFn: (values: FormValues) => storesApi.create({
      name: values.name,
      phone: values.phone || "",
      address: values.address || "",
      returnWindow: values.returnWindow,
      customWindowDays: values.customWindowDays ?? undefined,
      returnCondition: values.returnCondition,
      refundType: values.refundType,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Store created successfully.");
      router.push("/dashboard/stores");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create store.");
    },
  });

  function onSubmit(values: FormValues) {
    createStore(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in slide-in-from-bottom-2 duration-500 max-w-2xl">
        
        {/* General Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            <Store className="w-4 h-4" />
            General Information
          </div>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Downtown Branch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional contact number.
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
                      placeholder="123 Main St, City, Country" 
                      className="resize-none min-h-[40px] py-2"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional physical address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Return Policy Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 border-b pb-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            <RefreshCcw className="w-4 h-4" />
            Return Policy
          </div>

          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="returnWindow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Window</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a return window" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Returns Accepted</SelectItem>
                      <SelectItem value="3_days">3 Days</SelectItem>
                      <SelectItem value="7_days">7 Days</SelectItem>
                      <SelectItem value="14_days">14 Days</SelectItem>
                      <SelectItem value="30_days">30 Days</SelectItem>
                      <SelectItem value="custom">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How long does a customer have to return an item?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchReturnWindow === "custom" && (
              <FormField
                control={form.control}
                name="customWindowDays"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in zoom-in-95 duration-200">
                    <FormLabel>Custom Window (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {watchReturnWindow !== "none" && (
            <div className="grid gap-6 animate-in fade-in duration-300">
              <FormField
                control={form.control}
                name="returnCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any_condition">Any Condition</SelectItem>
                        <SelectItem value="original_packaging">Original Packaging</SelectItem>
                        <SelectItem value="unused">Unused</SelectItem>
                        <SelectItem value="defective_only">Defective Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      What condition must the item be in?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refundType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refund Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select refund type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_refund">Full Refund</SelectItem>
                        <SelectItem value="partial_refund">Partial Refund</SelectItem>
                        <SelectItem value="store_credit">Store Credit Only</SelectItem>
                        <SelectItem value="exchange_only">Exchange Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How will the customer be compensated?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="pt-8 border-t flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            disabled={isPending}
            onClick={() => router.push("/dashboard/stores")}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || !form.formState.isValid}
            className="rounded-full px-8 shadow-sm"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Store
          </Button>
        </div>
      </form>
    </Form>
  );
}
