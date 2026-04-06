"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Store as StoreIcon } from "lucide-react";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Store details error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 mt-12 max-w-2xl mx-auto border border-destructive/20 bg-destructive/5 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
        <StoreIcon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">Failed to load store details</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        There was an error communicating with the server. Please check your connection or try again.
      </p>
      <div className="flex items-center gap-4">
        <Button variant="default" onClick={() => reset()} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}