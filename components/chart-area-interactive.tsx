"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardStatsQueryOptions } from "@/lib/queries/dashboard";

const chartConfig = {
  receipts: {
    label: "Receipts",
    color: "var(--chart-1)",
  },
  returns: {
    label: "Returns",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [range, setRange] = React.useState<"7d" | "30d">("30d");

  React.useEffect(() => {
    if (isMobile) {
      setRange("7d");
    }
  }, [isMobile]);

  const { data, isPending, isError } = useQuery(
    dashboardStatsQueryOptions(range),
  );

  const chartData = data?.timeseries ?? [];

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Receipts vs returns</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily counts for your stores
          </span>
          <span className="@[540px]/card:hidden">By day</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => {
              if (v === "7d" || v === "30d") setRange(v);
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={range}
            onValueChange={(v) => {
              if (v === "7d" || v === "30d") setRange(v);
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select range"
            >
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isPending ? (
          <Skeleton className="aspect-auto h-[250px] w-full rounded-lg" />
        ) : isError ? (
          <div className="flex aspect-auto h-[250px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Could not load chart data.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value) => {
                  const date = new Date(`${value}T12:00:00.000Z`);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const date = new Date(`${value}T12:00:00.000Z`);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    indicator="line"
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke="var(--color-returns)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="receipts"
                stroke="var(--color-receipts)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
