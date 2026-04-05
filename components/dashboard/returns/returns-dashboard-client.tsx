"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { returnsApi } from "@/lib/api";
import {
  returnDetailQueryOptions,
  returnsListQueryOptions,
} from "@/lib/queries/returns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  RefreshCw,
  Search,
  ImageIcon,
} from "lucide-react";
import type { ReturnListRow, RetailerReturnBundle } from "@/lib/api";

const LIST_LIMIT = 50;

const REASON_LABELS: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong item",
  changed_mind: "Changed mind",
  damaged_in_delivery: "Damaged in delivery",
  other: "Other",
};

function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isVideoEvidenceUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);
}

function ReturnRowCells({
  row,
  onReview,
}: {
  row: ReturnListRow;
  onReview: (id: string) => void;
}) {
  const rr = row.returnRequest as {
    id?: string;
    returnNumber?: string;
    status?: string;
    createdAt?: string;
    reasonCode?: string;
  };
  const store = row.store as { name?: string };
  const customer = row.customer as { name?: string; email?: string } | null;
  const created = rr.createdAt ? new Date(rr.createdAt) : null;

  return (
    <TableRow>
      <TableCell className="font-medium">{rr.returnNumber ?? "—"}</TableCell>
      <TableCell>{store.name ?? "—"}</TableCell>
      <TableCell className="max-w-[140px] truncate">
        {customer?.name ?? customer?.email ?? "—"}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{formatStatusLabel(rr.status ?? "")}</Badge>
      </TableCell>
      <TableCell>
        {REASON_LABELS[rr.reasonCode ?? ""] ?? rr.reasonCode ?? "—"}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {row.itemCount ?? 0} / {row.photoCount ?? 0}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {created ? (
          <>
            {format(created, "MMM d, yyyy")}
            <span className="block text-xs">
              {formatDistanceToNow(created, { addSuffix: true })}
            </span>
          </>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => rr.id && onReview(rr.id)}
          disabled={!rr.id}
        >
          Review
        </Button>
      </TableCell>
    </TableRow>
  );
}

function EvidenceGrid({ photos }: { photos: { id: string; url: string }[] }) {
  if (!photos.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-muted-foreground">
        <ImageIcon className="mb-2 size-8 opacity-50" />
        <p className="text-sm">No photos or videos uploaded</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {photos.map((p) => (
        <div
          key={p.id}
          className="overflow-hidden rounded-xl border bg-muted/30"
        >
          {isVideoEvidenceUrl(p.url) ? (
            <video
              src={p.url}
              controls
              className="max-h-56 w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.url}
              alt="Return evidence"
              className="max-h-56 w-full object-contain"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ReturnDetailBody({
  bundle,
}: {
  bundle: RetailerReturnBundle;
}) {
  const rr = bundle.returnRequest as Record<string, unknown>;
  const receipt = bundle.receipt as Record<string, unknown>;
  const currency = (receipt.currency as string) || "GHS";

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="secondary">
            {formatStatusLabel(String(rr.status ?? ""))}
          </Badge>
        </div>
        {(rr.description as string) && (
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Customer note
            </p>
            <p className="mt-1">{String(rr.description)}</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Items
        </h4>
        <ul className="divide-y rounded-lg border">
          {bundle.items.map(({ lineItem, returnItem }) => {
            const li = lineItem as Record<string, unknown>;
            const qty = (returnItem as { quantityReturned?: number })
              .quantityReturned;
            const unit = parseFloat(String(li.unitPrice ?? "0"));
            const name = String(li.name ?? "Item");
            return (
              <li
                key={String((returnItem as { id?: string }).id ?? name)}
                className="flex justify-between gap-4 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <span className="shrink-0 text-muted-foreground">
                  ×{qty}{" "}
                  <span className="text-foreground">
                    {formatCurrency(unit * (qty ?? 1), currency)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Photo / video evidence
        </h4>
        <EvidenceGrid photos={bundle.photos} />
      </div>
    </div>
  );
}

export function ReturnsDashboardClient() {
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState<"pending" | "all">("pending");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetReturnId, setSheetReturnId] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const pendingQuery = useQuery({
    ...returnsListQueryOptions({
      pending_review: true,
      limit: LIST_LIMIT,
    }),
    enabled: mainTab === "pending",
  });

  const allQuery = useQuery({
    ...returnsListQueryOptions({
      limit: LIST_LIMIT,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    enabled: mainTab === "all",
  });

  const activeList = mainTab === "pending" ? pendingQuery : allQuery;
  const rows = activeList.data?.returns ?? [];
  const totalCount = activeList.data?.totalCount;

  const detailQuery = useQuery({
    ...returnDetailQueryOptions(sheetReturnId),
    enabled: sheetOpen && !!sheetReturnId,
  });

  const bundle = detailQuery.data;

  const invalidateReturns = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["returns"] });
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => returnsApi.approve(id),
    onSuccess: () => {
      toast.success("Return approved.");
      setApproveOpen(false);
      setSheetOpen(false);
      setSheetReturnId(null);
      invalidateReturns();
    },
    onError: (e: Error) => toast.error(e.message || "Could not approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      returnsApi.reject(id, reason),
    onSuccess: () => {
      toast.success("Return rejected.");
      setRejectOpen(false);
      setRejectReason("");
      setSheetOpen(false);
      setSheetReturnId(null);
      invalidateReturns();
    },
    onError: (e: Error) => toast.error(e.message || "Could not reject"),
  });

  const markReceivedMutation = useMutation({
    mutationFn: (id: string) => returnsApi.markReceived(id),
    onSuccess: () => {
      toast.success("Marked as received at your location.");
      setSheetOpen(false);
      setSheetReturnId(null);
      invalidateReturns();
    },
    onError: (e: Error) =>
      toast.error(e.message || "Could not mark as received"),
  });

  const rrStatus = (bundle?.returnRequest as { status?: string } | undefined)
    ?.status;
  const canApproveReject =
    rrStatus === "pending" || rrStatus === "pickup_scheduled";
  const canMarkReceived = rrStatus === "approved";

  const openReview = (id: string) => {
    setSheetReturnId(id);
    setSheetOpen(true);
  };

  const pendingLoading = mainTab === "pending" && pendingQuery.isPending;
  const allLoading = mainTab === "all" && allQuery.isPending;

  const listLoading = pendingLoading || allLoading;

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All statuses" },
      { value: "pending", label: "Pending" },
      { value: "pickup_scheduled", label: "Pickup scheduled" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "with_retailer", label: "With retailer" },
      { value: "collected", label: "Collected" },
      { value: "in_transit", label: "In transit" },
      { value: "refunded", label: "Refunded" },
      { value: "completed", label: "Completed" },
    ],
    [],
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Returns</h2>
          <p className="text-muted-foreground mt-1">
            Review requests, inspect evidence, approve or reject, and mark items
            when received.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => activeList.refetch()}
          disabled={activeList.isFetching}
        >
          <RefreshCw
            className={cn("size-4", activeList.isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as "pending" | "all")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="pending">Pending review</TabsTrigger>
          <TabsTrigger value="all">All returns</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Returns awaiting your decision (
            {totalCount ?? rows.length}
            {totalCount != null ? ` total` : ""}).
          </p>
          <ReturnsTable
            rows={rows}
            loading={listLoading}
            error={pendingQuery.isError}
            onRetry={() => pendingQuery.refetch()}
            onReview={openReview}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by return #, receipt #, or customer…"
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ReturnsTable
            rows={rows}
            loading={listLoading}
            error={allQuery.isError}
            onRetry={() => allQuery.refetch()}
            onReview={openReview}
          />
          {totalCount != null && (
            <p className="text-xs text-muted-foreground">
              Showing {rows.length} of {totalCount} results
            </p>
          )}
        </TabsContent>
      </Tabs>

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSheetReturnId(null);
            setApproveOpen(false);
            setRejectOpen(false);
            setRejectReason("");
          }
        }}
      >
        <SheetContent
          className="flex w-full flex-col overflow-y-auto sm:max-w-xl"
          showCloseButton
        >
          <SheetHeader>
            <SheetTitle>Return request</SheetTitle>
            <SheetDescription>
              Inspect evidence and line items before making a decision.
            </SheetDescription>
          </SheetHeader>

          {detailQuery.isLoading && (
            <div className="space-y-4 px-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {detailQuery.isError && (
            <p className="text-destructive px-4 text-sm">
              Could not load return details.
            </p>
          )}

          {bundle && !detailQuery.isLoading && (
            <>
              <div className="border-b px-4 pb-4">
                <p className="font-mono text-lg font-semibold">
                  {(bundle.returnRequest as { returnNumber?: string })
                    .returnNumber ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(bundle.store as { name?: string }).name ?? ""}
                </p>
              </div>
              <ReturnDetailBody bundle={bundle} />
              <div className="mt-auto flex flex-col gap-2 border-t p-4 sm:flex-row sm:flex-wrap">
                {canApproveReject && sheetReturnId && (
                  <>
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => setApproveOpen(true)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setRejectOpen(true)}
                      disabled={rejectMutation.isPending}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {canMarkReceived && sheetReturnId && (
                  <Button
                    variant="secondary"
                    className="w-full gap-2 sm:flex-1"
                    onClick={() => markReceivedMutation.mutate(sheetReturnId)}
                    disabled={markReceivedMutation.isPending}
                  >
                    {markReceivedMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Mark received
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Approve this return?</DialogTitle>
            <DialogDescription>
              The customer will be notified and refund processing can continue
              according to your policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2"
              onClick={() =>
                sheetReturnId && approveMutation.mutate(sheetReturnId)
              }
              disabled={!sheetReturnId || approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Confirm approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Reject return</DialogTitle>
            <DialogDescription>
              Provide a short reason for the customer (required).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!sheetReturnId || !rejectReason.trim()) {
                  toast.error("Please enter a rejection reason.");
                  return;
                }
                rejectMutation.mutate({
                  id: sheetReturnId,
                  reason: rejectReason.trim(),
                });
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Reject return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReturnsTable({
  rows,
  loading,
  error,
  onRetry,
  onReview,
}: {
  rows: ReturnListRow[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onReview: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3 rounded-xl border p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12">
        <p className="text-destructive mb-4 text-sm">Failed to load returns.</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Package className="mb-3 size-10 text-muted-foreground opacity-50" />
        <p className="font-medium">No returns in this view</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          When customers submit return requests, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Return #</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Items / media</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = (row.returnRequest as { id?: string }).id ?? "";
            return (
              <ReturnRowCells
                key={id}
                row={row}
                onReview={onReview}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
