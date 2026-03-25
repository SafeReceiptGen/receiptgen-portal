"use client";

import { Receipt } from "@/types/retailers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptStatusBadge } from "./status-badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ReceiptCardsProps {
  receipts: Receipt[];
}

export function ReceiptCards({ receipts }: ReceiptCardsProps) {
  if (receipts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No receipts found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {receipts.map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} />
      ))}
    </div>
  );
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = new Date(receipt.purchasedAt).toLocaleDateString(
    "en-US",
    {
      year: "2-digit",
      month: "short",
      day: "numeric",
    }
  );

  const mainItem = receipt.items[0];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base">{receipt.receiptNumber}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {receipt.customerName} • {formattedDate}
            </CardDescription>
          </div>
          <ReceiptStatusBadge status={receipt.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">{mainItem.name}</p>
          <p className="font-semibold text-sm">
            {receipt.currency} {receipt.total.toFixed(2)}
          </p>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t space-y-3 text-sm">
            <div className="space-y-2">
              <p className="font-semibold">Items</p>
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span>
                    {receipt.currency} {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 rounded p-3 space-y-2">
              <p className="font-semibold">Details</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{receipt.customerPhone || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <span>{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Returnable:</span>
                  <span>
                    <Badge variant={receipt.isReturnable ? "default" : "secondary"}>
                      {receipt.isReturnable ? "Yes" : "No"}
                    </Badge>
                  </span>
                </div>
              </div>
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
