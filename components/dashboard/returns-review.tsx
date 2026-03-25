"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Return } from "@/types/retailers";
import { ReturnStatusBadge } from "./status-badge";
import { CheckCircle, XCircle } from "lucide-react";

interface ReturnsReviewProps {
  returns: Return[];
  onApprove?: (returnId: string) => void;
  onReject?: (returnId: string, reason: string) => void;
}

export function ReturnsReview({
  returns,
  onApprove,
  onReject,
}: ReturnsReviewProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [updatedReturns, setUpdatedReturns] = useState<Set<string>>(new Set());

  const handleApprove = (returnId: string) => {
    onApprove?.(returnId);
    setUpdatedReturns((prev) => new Set([...prev, returnId]));
  };

  const handleRejectSubmit = (returnId: string) => {
    if (rejectionReason.trim()) {
      onReject?.(returnId, rejectionReason);
      setUpdatedReturns((prev) => new Set([...prev, returnId]));
      setRejectionReason("");
      setSelectedReturnId(null);
    }
  };

  const pendingReturns = returns.filter((r) => r.status === "pending");
  const otherReturns = returns.filter((r) => r.status !== "pending");

  if (returns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No returns to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingReturns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Pending Returns</h3>
            <Badge variant="default">{pendingReturns.length}</Badge>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Return Reason</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReturns.map((ret) => (
                    <PendingReturnRow
                      key={ret.id}
                      return={ret}
                      onApprove={() => handleApprove(ret.id)}
                      onRejectClick={() => setSelectedReturnId(ret.id)}
                      isUpdated={updatedReturns.has(ret.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      )}

      {otherReturns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Return History</h3>
          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherReturns.map((ret) => (
                    <HistoryReturnRow key={ret.id} return={ret} />
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      )}

      <RejectReturnDialog
        isOpen={selectedReturnId !== null}
        onOpenChange={(open) => !open && setSelectedReturnId(null)}
        onSubmit={() =>
          selectedReturnId &&
          handleRejectSubmit(selectedReturnId)
        }
        value={rejectionReason}
        onChange={setRejectionReason}
      />
    </div>
  );
}

function PendingReturnRow({
  return: ret,
  onApprove,
  onRejectClick,
  isUpdated,
}: {
  return: Return;
  onApprove: () => void;
  onRejectClick: () => void;
  isUpdated: boolean;
}) {
  const formattedDate = new Date(ret.requestedAt).toLocaleDateString(
    "en-US",
    {
      year: "2-digit",
      month: "short",
      day: "numeric",
    }
  );

  const mainItem = ret.items[0];

  return (
    <TableRow className={isUpdated ? "bg-green-50 dark:bg-green-950/20" : ""}>
      <TableCell className="font-medium text-sm">{ret.receiptNumber}</TableCell>
      <TableCell className="text-sm">{ret.customerName}</TableCell>
      <TableCell className="text-sm max-w-xs truncate">
        {mainItem.name}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{formattedDate}</TableCell>
      <TableCell className="text-sm max-w-xs truncate">
        {ret.returnReason}
      </TableCell>
      <TableCell className="font-semibold">
        {ret.currency} {ret.refundAmount.toFixed(2)}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={onApprove}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Return Approved</DialogTitle>
                <DialogDescription>
                  Return request for {ret.receiptNumber} has been approved.
                  Refund of {ret.currency} {ret.refundAmount.toFixed(2)} will be
                  processed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={onRejectClick}
          >
            <XCircle className="h-4 w-4 text-red-600" />
            Reject
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function HistoryReturnRow({ return: ret }: { return: Return }) {
  const formattedDate = new Date(ret.requestedAt).toLocaleDateString(
    "en-US",
    {
      year: "2-digit",
      month: "short",
      day: "numeric",
    }
  );

  const mainItem = ret.items[0];

  return (
    <TableRow>
      <TableCell className="font-medium text-sm">{ret.receiptNumber}</TableCell>
      <TableCell className="text-sm">{ret.customerName}</TableCell>
      <TableCell className="text-sm max-w-xs truncate">
        {mainItem.name}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{formattedDate}</TableCell>
      <TableCell className="text-sm max-w-xs truncate">
        {ret.returnReason}
        {ret.rejectionReason && ` - ${ret.rejectionReason}`}
      </TableCell>
      <TableCell>
        <ReturnStatusBadge status={ret.status} />
      </TableCell>
    </TableRow>
  );
}

function RejectReturnDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  value,
  onChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Return Request</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this return request. The customer
            will be notified.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Enter rejection reason..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-24"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="gap-2">
            <XCircle className="h-4 w-4" />
            Reject Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
