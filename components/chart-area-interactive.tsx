"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", valid: 222, fraud: 150 },
  { date: "2024-04-02", valid: 97, fraud: 180 },
  { date: "2024-04-03", valid: 167, fraud: 120 },
  { date: "2024-04-04", valid: 242, fraud: 260 },
  { date: "2024-04-05", valid: 373, fraud: 290 },
  { date: "2024-04-06", valid: 301, fraud: 340 },
  { date: "2024-04-07", valid: 245, fraud: 180 },
  { date: "2024-04-08", valid: 409, fraud: 320 },
  { date: "2024-04-09", valid: 59, fraud: 110 },
  { date: "2024-04-10", valid: 261, fraud: 190 },
  { date: "2024-04-11", valid: 327, fraud: 350 },
  { date: "2024-04-12", valid: 292, fraud: 210 },
  { date: "2024-04-13", valid: 342, fraud: 380 },
  { date: "2024-04-14", valid: 137, fraud: 220 },
  { date: "2024-04-15", valid: 120, fraud: 170 },
  { date: "2024-04-16", valid: 138, fraud: 190 },
  { date: "2024-04-17", valid: 446, fraud: 360 },
  { date: "2024-04-18", valid: 364, fraud: 410 },
  { date: "2024-04-19", valid: 243, fraud: 180 },
  { date: "2024-04-20", valid: 89, fraud: 150 },
  { date: "2024-04-21", valid: 137, fraud: 200 },
  { date: "2024-04-22", valid: 224, fraud: 170 },
  { date: "2024-04-23", valid: 138, fraud: 230 },
  { date: "2024-04-24", valid: 387, fraud: 290 },
  { date: "2024-04-25", valid: 215, fraud: 250 },
  { date: "2024-04-26", valid: 75, fraud: 130 },
  { date: "2024-04-27", valid: 383, fraud: 420 },
  { date: "2024-04-28", valid: 122, fraud: 180 },
  { date: "2024-04-29", valid: 315, fraud: 240 },
  { date: "2024-04-30", valid: 454, fraud: 380 },
  { date: "2024-05-01", valid: 165, fraud: 220 },
  { date: "2024-05-02", valid: 293, fraud: 310 },
  { date: "2024-05-03", valid: 247, fraud: 190 },
  { date: "2024-05-04", valid: 385, fraud: 420 },
  { date: "2024-05-05", valid: 481, fraud: 390 },
  { date: "2024-05-06", valid: 498, fraud: 520 },
  { date: "2024-05-07", valid: 388, fraud: 300 },
  { date: "2024-05-08", valid: 149, fraud: 210 },
  { date: "2024-05-09", valid: 227, fraud: 180 },
  { date: "2024-05-10", valid: 293, fraud: 330 },
  { date: "2024-05-11", valid: 335, fraud: 270 },
  { date: "2024-05-12", valid: 197, fraud: 240 },
  { date: "2024-05-13", valid: 197, fraud: 160 },
  { date: "2024-05-14", valid: 448, fraud: 490 },
  { date: "2024-05-15", valid: 473, fraud: 380 },
  { date: "2024-05-16", valid: 338, fraud: 400 },
  { date: "2024-05-17", valid: 499, fraud: 420 },
  { date: "2024-05-18", valid: 315, fraud: 350 },
  { date: "2024-05-19", valid: 235, fraud: 180 },
  { date: "2024-05-20", valid: 177, fraud: 230 },
  { date: "2024-05-21", valid: 82, fraud: 140 },
  { date: "2024-05-22", valid: 81, fraud: 120 },
  { date: "2024-05-23", valid: 252, fraud: 290 },
  { date: "2024-05-24", valid: 294, fraud: 220 },
  { date: "2024-05-25", valid: 201, fraud: 250 },
  { date: "2024-05-26", valid: 213, fraud: 170 },
  { date: "2024-05-27", valid: 420, fraud: 460 },
  { date: "2024-05-28", valid: 233, fraud: 190 },
  { date: "2024-05-29", valid: 78, fraud: 130 },
  { date: "2024-05-30", valid: 340, fraud: 280 },
  { date: "2024-05-31", valid: 178, fraud: 230 },
  { date: "2024-06-01", valid: 178, fraud: 200 },
  { date: "2024-06-02", valid: 470, fraud: 410 },
  { date: "2024-06-03", valid: 103, fraud: 160 },
  { date: "2024-06-04", valid: 439, fraud: 380 },
  { date: "2024-06-05", valid: 88, fraud: 140 },
  { date: "2024-06-06", valid: 294, fraud: 250 },
  { date: "2024-06-07", valid: 323, fraud: 370 },
  { date: "2024-06-08", valid: 385, fraud: 320 },
  { date: "2024-06-09", valid: 438, fraud: 480 },
  { date: "2024-06-10", valid: 155, fraud: 200 },
  { date: "2024-06-11", valid: 92, fraud: 150 },
  { date: "2024-06-12", valid: 492, fraud: 420 },
  { date: "2024-06-13", valid: 81, fraud: 130 },
  { date: "2024-06-14", valid: 426, fraud: 380 },
  { date: "2024-06-15", valid: 307, fraud: 350 },
  { date: "2024-06-16", valid: 371, fraud: 310 },
  { date: "2024-06-17", valid: 475, fraud: 520 },
  { date: "2024-06-18", valid: 107, fraud: 170 },
  { date: "2024-06-19", valid: 341, fraud: 290 },
  { date: "2024-06-20", valid: 408, fraud: 450 },
  { date: "2024-06-21", valid: 169, fraud: 210 },
  { date: "2024-06-22", valid: 317, fraud: 270 },
  { date: "2024-06-23", valid: 480, fraud: 530 },
  { date: "2024-06-24", valid: 132, fraud: 180 },
  { date: "2024-06-25", valid: 141, fraud: 190 },
  { date: "2024-06-26", valid: 434, fraud: 380 },
  { date: "2024-06-27", valid: 448, fraud: 490 },
  { date: "2024-06-28", valid: 149, fraud: 200 },
  { date: "2024-06-29", valid: 103, fraud: 160 },
  { date: "2024-06-30", valid: 446, fraud: 400 },
]

const chartConfig = {
  returns: {
    label: "Returns",
  },
  valid: {
    label: "Valid",
    color: "var(--primary)",
  },
  fraud: {
    label: "Fraud Alert",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Return Requests</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillValid" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-valid)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-valid)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillFraud" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-fraud)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-fraud)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="fraud"
              type="natural"
              fill="url(#fillFraud)"
              stroke="var(--color-fraud)"
              stackId="a"
            />
            <Area
              dataKey="valid"
              type="natural"
              fill="url(#fillValid)"
              stroke="var(--color-valid)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
