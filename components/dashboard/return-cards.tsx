"use client";

import { Return } from "@/types/retailers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReturnStatusBadge } from "./status-badge";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReturnCardsProps {
  returns: Return[];
  onApprove?: (returnId: string) => void;
  onReject?: (returnId: string, reason: string) => void;
}

export function ReturnCards({
  returns,
  onApprove,
  onReject,
}: ReturnCardsProps) {
  if (returns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No returns to review</p>
      </div>
    );
  }

  const pendingReturns = returns.filter((r) => r.status === "pending");
  const otherReturns = returns.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {pendingReturns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Pending Returns</h3>
            <Badge variant="default">{pendingReturns.length}</Badge>
          </div>
          {pendingReturns.map((ret) => (
            <PendingReturnCard
              key={ret.id}
              return={ret}
              onApprove={() => onApprove?.(ret.id)}
              onReject={(reason) => onReject?.(ret.id, reason)}
            />
          ))}
        </div>
      )}

      {otherReturns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Return History</h3>
          {otherReturns.map((ret) => (
            <HistoryReturnCard key={ret.id} return={ret} />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingReturnCard({
  return: ret,
  onApprove,
  onReject,
}: {
  return: Return;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const mainItem = ret.items[0];

  const handleRejectSubmit = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
      setRejectionReason("");
      setIsRejecting(false);
    }
  };

  return (
    <Card className="border-yellow-200 dark:border-yellow-900/50 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base">{ret.receiptNumber}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {ret.customerName} • Requested{" "}
              {new Date(ret.requestedAt).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <ReturnStatusBadge status={ret.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Item</p>
          <p className="text-sm mt-1">{mainItem.name}</p>
        </div>

        <div className="flex items-center justify-between py-2 bg-muted/50 rounded px-3">
          <span className="text-sm text-muted-foreground">Refund Amount</span>
          <span className="font-semibold">
            {ret.currency} {ret.refundAmount.toFixed(2)}
          </span>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-2">Return Reason</p>
              <p className="text-sm text-muted-foreground">{ret.returnReason}</p>
            </div>
            {ret.reasonDescription && (
              <div>
                <p className="font-semibold mb-2">Details</p>
                <p className="text-sm text-muted-foreground">{ret.reasonDescription}</p>
              </div>
            )}
            <div>
              <p className="font-semibold mb-2">Customer Contact</p>
              <p className="text-sm">{ret.customerPhone || "N/A"}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-center gap-2 mb-4"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show Details
            </>
          )}
        </Button>

        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="flex-1 gap-1"
                onClick={onApprove}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Return Approved</DialogTitle>
                <DialogDescription>
                  Return request for {ret.receiptNumber} has been approved.
                  Refund of {ret.currency} {ret.refundAmount.toFixed(2)} will
                  be processed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRejecting} onOpenChange={setIsRejecting}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1 gap-1">
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Return Request</DialogTitle>
                <DialogDescription>
                  Provide a reason for rejecting this return request.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-24"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejecting(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRejectSubmit} className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryReturnCard({ return: ret }: { return: Return }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const mainItem = ret.items[0];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base">{ret.receiptNumber}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {ret.customerName} • {ret.returnReason}
            </CardDescription>
          </div>
          <ReturnStatusBadge status={ret.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Item</p>
          <p className="text-sm mt-1">{mainItem.name}</p>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t space-y-3 text-sm">
            {ret.rejectionReason && (
              <div>
                <p className="font-semibold mb-2">Rejection Reason</p>
                <p className="text-sm text-muted-foreground">{ret.rejectionReason}</p>
              </div>
            )}
            <div>
              <p className="font-semibold mb-2">Customer Contact</p>
              <p className="text-sm">{ret.customerPhone || "N/A"}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-center gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
