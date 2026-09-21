"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { reportSummaryQueryOptions } from "@/lib/queries/reports";
import { reportSalesInsight } from "@/lib/report-insights";
import { downloadReportPdf } from "@/lib/report-pdf-download";
import {
  currentMonthKey,
  endOfLocalDayIso,
  formatMonthLabel,
  formatRangeLabel,
  lastNMonthOptions,
  monthRangeIso,
  startOfLocalDayIso,
} from "@/lib/report-range";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChartBar } from "@tabler/icons-react";
import { ReportMetricCards, ReportMetricCardsSkeleton } from "./report-metric-cards";
import { ReportBreakdowns } from "./report-tables";
import { ReportTrendChart } from "./report-trend-chart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const monthOptions = lastNMonthOptions(12);

export function ReportsClient() {
  const defaultMonth = currentMonthKey();
  const [month, setMonth] = useQueryState(
    "month",
    parseAsString.withDefault(defaultMonth),
  );
  const [fromParam, setFromParam] = useQueryState("from", parseAsString);
  const [toParam, setToParam] = useQueryState("to", parseAsString);
  const [downloading, setDownloading] = useState(false);

  const isCustomRange = Boolean(fromParam && toParam);
  const compareLabel = isCustomRange ? "previous period" : "last month";

  const queryParams = useMemo(() => {
    if (fromParam && toParam) return { from: fromParam, to: toParam };
    return monthRangeIso(month || defaultMonth);
  }, [fromParam, toParam, month, defaultMonth]);

  const customRange: DateRange | undefined = useMemo(() => {
    if (!fromParam || !toParam) return undefined;
    return { from: new Date(fromParam), to: new Date(toParam) };
  }, [fromParam, toParam]);

  const { data, isPending, isError } = useQuery(
    reportSummaryQueryOptions(queryParams),
  );

  const insight = data ? reportSalesInsight(data, compareLabel) : null;
  const rangeLabel = data
    ? formatRangeLabel(data.range.from, data.range.to)
    : formatRangeLabel(queryParams.from, queryParams.to);
  const isEmpty =
    !!data &&
    data.totals.transactionCount === 0 &&
    data.totals.otherCurrencyCount === 0;

  const handleMonthChange = (value: string) => {
    void setMonth(value);
    void setFromParam(null);
    void setToParam(null);
  };

  const handleCustomRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      void setFromParam(null);
      void setToParam(null);
      return;
    }
    void setFromParam(startOfLocalDayIso(range.from));
    if (range.to) {
      void setToParam(endOfLocalDayIso(range.to));
    }
  };

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const filename = isCustomRange
        ? `report-${queryParams.from.slice(0, 10)}-to-${queryParams.to.slice(0, 10)}.pdf`
        : `report-${month || defaultMonth}.pdf`;
      await downloadReportPdf({
        data,
        title: "Monthly sales report",
        rangeLabel,
        insight: insight ?? "",
        filename,
      });
    } catch {
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Sales, products, returns, and customer activity for{" "}
            {isCustomRange ? rangeLabel : formatMonthLabel(month || defaultMonth)}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[200px]" aria-label="Select month">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !isCustomRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon />
                {isCustomRange && customRange?.from && customRange.to
                  ? `${format(customRange.from, "d MMM")} – ${format(customRange.to, "d MMM yyyy")}`
                  : "Custom range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={handleCustomRange}
                numberOfMonths={2}
                defaultMonth={customRange?.from}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleDownload} disabled={!data || downloading}>
            {downloading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {isPending ? (
        <>
          <Skeleton className="h-5 w-72" />
          <ReportMetricCardsSkeleton />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </>
      ) : isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Could not load report</CardTitle>
            <CardDescription>
              Check your connection and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <p className="text-sm font-medium">{insight}</p>
          {data.totals.otherCurrencyCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              {data.totals.otherCurrencyCount} receipt
              {data.totals.otherCurrencyCount === 1 ? "" : "s"} in other
              currencies excluded from GHS totals.
            </p>
          ) : null}
          <ReportMetricCards data={data} compareLabel={compareLabel} />
          {isEmpty ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconChartBar />
                </EmptyMedia>
                <EmptyTitle>No receipts in this range</EmptyTitle>
                <EmptyDescription>
                  Issue receipts for this period and they will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <ReportTrendChart data={data.timeseries} />
              <ReportBreakdowns data={data} />
            </>
          )}
        </>
      )}
    </div>
  );
}
