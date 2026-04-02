import { Store } from "@/lib/api";
import { Store as StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StoreCard({ store }: { store: Store }) {
  const isActive = store.isActive ?? true;
  console.log("store", store);
  return (
    <div className="group flex flex-col gap-3">
      {/* Visual Box */}
      <div className="relative aspect-square flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-muted/20 transition-all duration-300 group-hover:bg-muted/40 group-hover:border-border/80 group-hover:shadow-sm">
        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isActive ? "secondary" : "outline"}
            className="h-6 px-2 text-[10px] font-medium tracking-wider uppercase bg-background/50 backdrop-blur-sm"
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Center Logo Placeholder */}
        <div className="p-4 rounded-xl bg-background/80 shadow-sm ring-1 ring-black/4 dark:ring-white/4">
          <StoreIcon className="w-8 h-8 text-muted-foreground stroke-[1.5]" />
        </div>

        {/* Subtle detail inside card: Address or Return Window */}
        <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
          <p className="text-[11px] font-medium text-muted-foreground/60 truncate">
            {store.address || "No address provided"}
          </p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5 uppercase tracking-widest">
            {String(store.returnPolicy?.returnWindow || "").replace(/_/g, " ") || "Default policy"}
          </p>
        </div>
      </div>

      {/* Label outside the box */}
      <div className="px-1 flex flex-col gap-0.5">
        <h3 className="font-semibold text-foreground tracking-tight line-clamp-1">
          {store.name}
        </h3>
        {store.phone && (
          <p className="text-xs text-muted-foreground">{store.phone}</p>
        )}
      </div>
    </div>
  );
}
