"use client";

import { useQuery } from "@tanstack/react-query";
import { storeQueryOptions } from "@/lib/queries/stores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreGeneralForm } from "./store-general-form";
import { StorePolicyForm } from "./store-policy-form";
import { StoreCatalogManager } from "./store-catalog-manager";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Loading from "./loading";

export function StoreDetailClient({ storeId }: { storeId: string }) {
  const { data: store, isPending, isFetching, isError } = useQuery(storeQueryOptions(storeId));

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    throw new Error("Failed to load store details");
  }

  if (!isPending && !isFetching && !store) {
    notFound();
  }

  // Double check store exists for TS inference
  if (!store) return null;

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