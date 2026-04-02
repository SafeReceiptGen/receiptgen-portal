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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { refundTypeEnum, returnConditionEnum, returnWindowEnum } from "@/types/enums";

const formSchema = z.object({
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

export function StorePolicyForm({ store }: { store: Store }) {
  const queryClient = useQueryClient();
  const policy = store.returnPolicy;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      returnWindow: policy?.returnWindow?.toString() || "30_days",
      customWindowDays: policy?.customWindowDays || undefined,
      returnCondition: policy?.returnCondition?.toString() || "any_condition",
      refundType: policy?.refundType?.toString() || "full_refund",
    },
  });

  const watchReturnWindow = form.watch("returnWindow");

  const { mutate: updatePolicy, isPending } = useMutation({
    mutationFn: (values: FormValues) => storesApi.updatePolicy(store.id, {
      ...values,
      customWindowDays: values.customWindowDays ?? undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores", store.id] });
      toast.success("Return policy updated successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update return policy.");
    },
  });

  function onSubmit(values: FormValues) {
    updatePolicy(values);
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div>
        <h3 className="text-lg font-medium">Return Policy</h3>
        <p className="text-sm text-muted-foreground">
          Configure the rules for returns and refunds for this store.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
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

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending || !form.formState.isDirty}
              className="rounded-full px-8 shadow-sm"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Policy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
