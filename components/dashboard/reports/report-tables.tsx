"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import {
  categorySalesSharePercent,
  formatSharePercent,
  isUncategorizedDominant,
} from "@/lib/report-insights";
import type { ReportSummary } from "@/lib/api";

function formatInt(n: number): string {
  return n.toLocaleString();
}

export function ReportBreakdowns({ data }: { data: ReportSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top products</CardTitle>
          <CardDescription>Highest sales in this range</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products sold in this range.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / SKU</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.map((product) => (
                  <TableRow key={`${product.sku ?? product.name}`}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.sku ?? "No SKU"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatInt(product.units)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(product.sales, "GHS")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top categories</CardTitle>
          <CardDescription>
            {isUncategorizedDominant(data) ? (
              <>
                Most sales have no category. Assign one when adding catalog
                items or issuing receipts.{" "}
                <Link
                  href="/dashboard/stores"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Manage store catalogs
                </Link>
              </>
            ) : data.hasUncategorized ? (
              "Items without a category are shown as Uncategorized"
            ) : (
              "Sales grouped by category"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No category data for this range.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCategories.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="font-medium">{row.category}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatInt(row.units)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.sales, "GHS")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatSharePercent(
                        categorySalesSharePercent(
                          row.sales,
                          data.totals.totalSales,
                        ),
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns & exchanges</CardTitle>
          <CardDescription>Requests created in this range</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Requests</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInt(data.returns.count)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Refund value</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(data.returns.value, "GHS")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Exchanges</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInt(data.returns.exchanges)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Completed / refunded</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInt(data.returns.completed)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer activity</CardTitle>
          <CardDescription>Unique shoppers on receipts in this range</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Unique customers</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInt(data.customers.unique)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>New</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInt(data.customers.new)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Returning</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatInt(data.customers.returning)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Loyalty activity</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  Not available
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
