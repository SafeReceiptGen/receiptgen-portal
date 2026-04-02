"use client";

import { useQuery } from "@tanstack/react-query";
import { storeQueryOptions } from "@/lib/queries/stores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreGeneralForm } from "./store-general-form";
import { StorePolicyForm } from "./store-policy-form";
import { StoreCatalogManager } from "./store-catalog-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RotateCcw, Store as StoreIcon } from "lucide-react";
import Link from "next/link";

export function StoreDetailClient({ storeId }: { storeId: string }) {
  const { data: store, isPending, isError, refetch } = useQuery(storeQueryOptions(storeId));

  if (isPending) {
    return <StoreDetailSkeleton />;
  }

  if (isError || !store) {
    return <StoreDetailError onRetry={() => refetch()} />;
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/stores">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Stores
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage details, return policies, and reusable receipt items.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList variant="line" className="w-full sm:w-auto h-auto mb-8 border-b rounded-none justify-start pb-0">
          <TabsTrigger 
            value="general" 
            className="py-3 px-4 text-sm transition-all"
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="policy" 
            className="py-3 px-4 text-sm transition-all"
          >
            Return Policy
          </TabsTrigger>
          <TabsTrigger 
            value="catalog" 
            className="py-3 px-4 text-sm transition-all"
          >
            Catalog Items
          </TabsTrigger>
        </TabsList>
        
        <div className="pt-2">
          <TabsContent value="general" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <StoreGeneralForm store={store} />
          </TabsContent>
          <TabsContent value="policy" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <StorePolicyForm store={store} />
          </TabsContent>
          <TabsContent value="catalog" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <StoreCatalogManager store={store} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function StoreDetailSkeleton() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto w-full">
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <Skeleton className="h-12 w-full sm:w-[400px] rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

function StoreDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 mt-12 max-w-2xl mx-auto border border-destructive/20 bg-destructive/5 rounded-2xl">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
        <StoreIcon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to load store details</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        There was an error communicating with the server. Please check your connection and try again.
      </p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  );
}
