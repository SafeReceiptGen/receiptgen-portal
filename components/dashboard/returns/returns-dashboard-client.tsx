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
import { formatPickupAddressDisplay } from "@/lib/format-pickup-address";
import { MOCK_PUDO_POINTS } from "@/lib/mock-data";
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
import type { PickupAddress } from "@/types/returns";

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

const REFUND_TYPE_LABELS: Record<string, string> = {
  full_refund: "Full refund",
  partial_refund: "Partial refund",
  store_credit: "Store credit",
  exchange_only: "Exchange only",
};

function mapsLinkFor(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function parseDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function retailerPickupFromReturnRequest(
  rr: Record<string, unknown>,
): PickupAddress {
  const line1 = String(rr.pickupAddressLine1 ?? "").trim();
  const city = String(rr.pickupCity ?? "").trim();
  const region = String(rr.pickupRegion ?? "").trim();
  const postal = String(rr.pickupPostalCode ?? "").trim();
  const landmark =
    String(rr.pickupLandmark ?? "").trim() ||
    String(rr.pickupAddressLine2 ?? "").trim() ||
    undefined;
  const hasLegacyStructured = city !== "" || region !== "";
  const address = hasLegacyStructured
    ? [line1, city, region, postal].filter(Boolean).join(", ")
    : line1;
  const lat = rr.pickupLatitude as number | null | undefined;
  const lng = rr.pickupLongitude as number | null | undefined;
  return {
    address,
    landmark,
    latitude: lat ?? undefined,
    longitude: lng ?? undefined,
  };
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
  const customer = bundle.customer as {
    name?: string | null;
    email?: string | null;
  } | null;

  const method = rr.logisticsMethod as "home_pickup" | "drop_off" | null;
  const created = parseDate(rr.createdAt);
  const reasonCode = String(rr.reasonCode ?? "");
  const pickupPa = retailerPickupFromReturnRequest(rr);
  const lat =
    typeof rr.pickupLatitude === "number" ? rr.pickupLatitude : null;
  const lng =
    typeof rr.pickupLongitude === "number" ? rr.pickupLongitude : null;
  const pudoId = (rr.logisticsPudoPointId as string) || "";
  const pudoPoint = MOCK_PUDO_POINTS.find((p) => p.id === pudoId);
  const refundTypeKey = String(rr.refundType ?? "");
  const refundAmtRaw = rr.refundAmount;
  const refundAmount =
    refundAmtRaw != null && String(refundAmtRaw).trim() !== ""
      ? parseFloat(String(refundAmtRaw))
      : null;
  const serviceFeeRaw = rr.serviceFee;
  const serviceFee =
    serviceFeeRaw != null && String(serviceFeeRaw).trim() !== ""
      ? parseFloat(String(serviceFeeRaw))
      : null;

  const parcelDesc = (rr.parcelDescription as string) || "";
  const pkgCount = rr.parcelPackageCount as number | null | undefined;
  const weightKg = rr.parcelWeightKg as string | null | undefined;

  const eligibilityResult = rr.eligibilityResult as boolean | null | undefined;
  const eligibilityChecked = parseDate(rr.eligibilityCheckedAt);
  const eligibilitySnap = rr.eligibilitySnapshot as
    | { reasons?: unknown[] }
    | null
    | undefined;
  const eligibilityReasons = Array.isArray(eligibilitySnap?.reasons)
    ? eligibilitySnap.reasons.filter((r): r is string => typeof r === "string")
    : [];

  const timelineEntries: { label: string; at: Date }[] = [];
  const pushTimeline = (label: string, v: unknown) => {
    const d = parseDate(v);
    if (d) timelineEntries.push({ label, at: d });
  };
  pushTimeline("Collected", rr.collectedAt);
  pushTimeline("In transit", rr.inTransitAt);
  pushTimeline("With retailer", rr.withRetailerAt);
  pushTimeline("Reviewed", rr.reviewedAt);
  pushTimeline("Resolved", rr.resolvedAt);

  const phoneCountry = String(rr.logisticsPhoneCountry ?? "").trim();
  const phone = String(rr.logisticsPhone ?? "").trim();
  const phoneDisplay =
    phoneCountry && phone
      ? `${phoneCountry} ${phone}`
      : phone || phoneCountry || "";

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="grid gap-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="secondary">
            {formatStatusLabel(String(rr.status ?? ""))}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <span className="text-muted-foreground">Submitted</span>
          <div className="text-right text-sm">
            {created ? (
              <>
                <span className="block">
                  {formatDistanceToNow(created, { addSuffix: true })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(created, "PPpp")}
                </span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Customer
        </p>
        <p className="mt-1 font-medium">
          {customer?.name?.trim() || "—"}
        </p>
        <p className="text-muted-foreground">
          {customer?.email?.trim() || "—"}
        </p>
      </div>

      <div className="rounded-lg border p-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Reason
        </p>
        <p className="mt-1">
          {(REASON_LABELS[reasonCode] ?? reasonCode) || "—"}
        </p>
        {(rr.description as string | undefined)?.trim() ? (
          <div className="mt-3 border-t pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Customer note
            </p>
            <p className="mt-1">{String(rr.description)}</p>
          </div>
        ) : null}
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

      <div className="space-y-3 rounded-lg border p-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Return method & logistics
          </p>
          {method === "home_pickup" ? (
            <Badge variant="outline">Home pickup</Badge>
          ) : method === "drop_off" ? (
            <Badge variant="outline">Drop-off</Badge>
          ) : null}
        </div>

        {method === "home_pickup" ? (
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Pickup address</p>
              <p className="mt-0.5">
                {formatPickupAddressDisplay(pickupPa)}
              </p>
              {lat != null && lng != null ? (
                <div className="mt-2 space-y-1">
                  <a
                    href={mapsLinkFor(lat, lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm font-medium underline underline-offset-2"
                  >
                    Open in Google Maps
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </p>
                </div>
              ) : null}
            </div>
            {parcelDesc.trim() ||
            (pkgCount != null && pkgCount > 0) ||
            (weightKg != null && String(weightKg).trim() !== "") ? (
              <div>
                <p className="text-xs text-muted-foreground">Parcel</p>
                {parcelDesc.trim() ? (
                  <p className="mt-0.5">{parcelDesc}</p>
                ) : null}
                <p className="text-muted-foreground mt-1 text-xs">
                  {pkgCount != null && pkgCount > 0
                    ? `${pkgCount} package(s)`
                    : null}
                  {pkgCount != null &&
                  pkgCount > 0 &&
                  weightKg != null &&
                  String(weightKg).trim() !== ""
                    ? " · "
                    : ""}
                  {weightKg != null && String(weightKg).trim() !== ""
                    ? `${weightKg} kg`
                    : null}
                </p>
              </div>
            ) : null}
          </div>
        ) : method === "drop_off" ? (
          <div>
            <p className="text-xs text-muted-foreground">PUDO point</p>
            <p className="mt-0.5">
              {pudoPoint?.name ?? (pudoId || "—")}
            </p>
            {pudoPoint?.address ? (
              <p className="text-muted-foreground mt-1 text-xs">
                {pudoPoint.address}
              </p>
            ) : null}
          </div>
        ) : null}

        {(rr.logisticsTimeSlot as string | null | undefined)?.trim() ? (
          <div>
            <p className="text-xs text-muted-foreground">Time slot</p>
            <p className="mt-0.5">{String(rr.logisticsTimeSlot)}</p>
          </div>
        ) : null}

        {phoneDisplay ? (
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="mt-0.5">{phoneDisplay}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 rounded-lg border p-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Fees & refund
        </p>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Service fee</span>
          <span>
            {serviceFee != null && Number.isFinite(serviceFee)
              ? formatCurrency(serviceFee, currency)
              : "—"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Refund type</span>
          <span>
            {(REFUND_TYPE_LABELS[refundTypeKey] ?? refundTypeKey) || "—"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Refund amount</span>
          <span>
            {refundAmount != null && Number.isFinite(refundAmount)
              ? formatCurrency(refundAmount, currency)
              : "—"}
          </span>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Eligibility
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {eligibilityResult === true ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
              Eligible
            </Badge>
          ) : eligibilityResult === false ? (
            <Badge variant="destructive">Not eligible</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          {eligibilityChecked ? (
            <span className="text-muted-foreground text-xs">
              Checked {format(eligibilityChecked, "PPpp")} ·{" "}
              {formatDistanceToNow(eligibilityChecked, { addSuffix: true })}
            </span>
          ) : null}
        </div>
        {eligibilityReasons.length > 0 ? (
          <ul className="text-muted-foreground list-inside list-disc text-xs">
            {eligibilityReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {timelineEntries.length > 0 ? (
        <div className="space-y-2 rounded-lg border p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Timeline
          </p>
          <ul className="space-y-1 text-xs">
            {timelineEntries.map(({ label, at }) => (
              <li key={`${label}-${at.getTime()}`}>
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {formatDistanceToNow(at, { addSuffix: true })}{" "}
                  <span className="text-muted-foreground/80">
                    ({format(at, "PPp")})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
          <TabsTrigger value="pending" className="flex-1 sm:flex-none text-foreground font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-sm">Pending review</TabsTrigger>
          <TabsTrigger value="all" className="flex-1 sm:flex-none text-foreground font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-sm">All returns</TabsTrigger>
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
