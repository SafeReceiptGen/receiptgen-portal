import { Button } from "@/components/ui/button";
import { Store as StoreIcon, MapPinOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 mt-12 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-6">
        <div className="p-6 rounded-3xl bg-muted/50 border border-border/50 text-muted-foreground shadow-sm">
          <StoreIcon className="w-12 h-12 opacity-50" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-background border shadow-sm text-destructive">
          <MapPinOff className="w-6 h-6" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold tracking-tight mb-3">Store Not Found</h3>
      
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        The store you are looking for doesn't exist, has been removed, or you don't have permission to view it.
      </p>
      
      <Button asChild variant="default" className="gap-2">
        <Link href="/dashboard/stores">
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Link>
      </Button>
    </div>
  );
}