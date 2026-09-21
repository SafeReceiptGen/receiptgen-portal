"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
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
import { formatCurrency } from "@/lib/currency";
import type { ReportTimeseriesPoint } from "@/lib/api";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ReportTrendChart({ data }: { data: ReportTimeseriesPoint[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales trend</CardTitle>
        <CardDescription>Daily GHS sales for the selected range</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8 }}>
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
                  formatter={(value) =>
                    formatCurrency(typeof value === "number" ? value : Number(value), "GHS")
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="var(--color-sales)"
              fill="var(--color-sales)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
