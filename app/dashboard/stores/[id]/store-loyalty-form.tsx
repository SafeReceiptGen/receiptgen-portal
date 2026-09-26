"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoyaltyProgram, retailerApi } from "@/lib/api";
import { loyaltyQueryOptions } from "@/lib/queries/retailer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => (typeof value === "number" ? value : Number(value)))
  .refine((value) => Number.isFinite(value) && value > 0, {
    message: "Must be greater than 0",
  })
  .refine(
    (value) => {
      const [, decimals = ""] = String(value).split(".");
      return decimals.length <= 2;
    },
    { message: "At most 2 decimal places" },
  );

const pointsSchema = z
  .union([z.string(), z.number()])
  .transform((value) => (typeof value === "number" ? value : Number(value)))
  .refine((value) => Number.isFinite(value) && Number.isInteger(value), {
    message: "Must be a whole number",
  })
  .refine((value) => value >= 1, {
    message: "Must be at least 1",
  });

const formSchema = z.object({
  enabled: z.boolean(),
  spendAmount: moneySchema,
  pointsAwarded: pointsSchema,
  rewardThreshold: pointsSchema,
  rewardAmount: moneySchema,
});

type LoyaltyFormInput = z.input<typeof formSchema>;
type LoyaltyFormValues = z.output<typeof formSchema>;

const defaultValues: LoyaltyFormInput = {
  enabled: false,
  spendAmount: 1,
  pointsAwarded: 1,
  rewardThreshold: 100,
  rewardAmount: 10,
};

function toFormValues(program: LoyaltyProgram): LoyaltyFormInput {
  return {
    enabled: program.enabled,
    spendAmount: Number(program.spendAmount),
    pointsAwarded: program.pointsAwarded,
    rewardThreshold: program.rewardThreshold,
    rewardAmount: Number(program.rewardAmount),
  };
}

function formatGhs(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "GHS —";
  return `GHS ${amount.toFixed(2)}`;
}

function formatPoints(value: unknown): string {
  const points = Number(value);
  if (!Number.isFinite(points)) return "— Points";
  return `${points} ${points === 1 ? "Point" : "Points"}`;
}

export function StoreLoyaltyForm() {
  const queryClient = useQueryClient();
  const {
    data: loyalty,
    isPending,
    isError,
    refetch,
  } = useQuery(loyaltyQueryOptions);

  const form = useForm<LoyaltyFormInput, unknown, LoyaltyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (loyalty) {
      form.reset(toFormValues(loyalty));
    }
  }, [form, loyalty]);

  const { mutate: saveLoyalty, isPending: isSaving } = useMutation({
    mutationFn: (values: LoyaltyFormValues) => retailerApi.upsertLoyalty(values),
    onSuccess: (data) => {
      queryClient.setQueryData(loyaltyQueryOptions.queryKey, data.loyaltyProgram);
      queryClient.invalidateQueries({ queryKey: loyaltyQueryOptions.queryKey });
      form.reset(toFormValues(data.loyaltyProgram));
      toast.success("Loyalty program saved.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save loyalty program.");
    },
  });

  const [enabled, spendAmount, pointsAwarded, rewardThreshold, rewardAmount] =
    useWatch({
      control: form.control,
      name: [
        "enabled",
        "spendAmount",
        "pointsAwarded",
        "rewardThreshold",
        "rewardAmount",
      ],
    });

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading loyalty settings…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card/50 p-5">
        <p className="text-sm text-muted-foreground">
          Could not load loyalty settings.
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div>
        <h3 className="text-lg font-medium">Loyalty Rewards</h3>
        <p className="text-sm text-muted-foreground">
          Set how customers earn points and what they get back. These rules
          apply to every store for this retailer.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => saveLoyalty(values))}
          className="space-y-6 max-w-xl"
        >
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-border bg-card/50 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-base">
                    Enable Loyalty Rewards
                  </FormLabel>
                  <FormDescription>
                    When enabled, customers automatically earn points when they
                    shop.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className={enabled ? undefined : "opacity-70"}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Earning Rule</h4>
                <p className="text-sm text-muted-foreground">
                  How much a customer must spend to earn points.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="spendAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spend Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            GHS
                          </span>
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0.01"
                            className="pl-12"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pointsAwarded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points Awarded</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          step="1"
                          min="1"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium">
                {formatGhs(spendAmount)} Spent = {formatPoints(pointsAwarded)}
              </p>
            </div>
          </div>

          <div className={enabled ? undefined : "opacity-70"}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Reward</h4>
                <p className="text-sm text-muted-foreground">
                  The discount a customer receives after reaching the point
                  threshold.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="rewardThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          step="1"
                          min="1"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rewardAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            GHS
                          </span>
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0.01"
                            className="pl-12"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium">
                {formatPoints(rewardThreshold)} = {formatGhs(rewardAmount)}{" "}
                Discount
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving || !form.formState.isDirty}
              className="rounded-full px-8 shadow-sm"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
