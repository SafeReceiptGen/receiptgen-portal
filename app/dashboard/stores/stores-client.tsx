"use client";

import { useQuery } from "@tanstack/react-query";
import { storesQueryOptions } from "@/lib/queries/stores";
import { StoreCard } from "./store-card";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function StoresClient() {
  const { data, isPending, isError, refetch } = useQuery(storesQueryOptions);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stores</h2>
          <p className="text-muted-foreground mt-1">
            Manage your retail locations, addresses, and return policies.
          </p>
        </div>
        <div className="flex items-center">
          <Button asChild className="gap-2 shadow-sm rounded-full px-5">
            <Link href="/dashboard/stores/new">
              <Plus className="w-4 h-4" />
              Create Store
            </Link>
          </Button>
        </div>
      </div>

      {/* States */}
      {isPending ? (
        <StoresGridSkeleton />
      ) : isError ? (
        <StoresError onRetry={() => refetch()} />
      ) : data?.stores?.length === 0 ? (
        <StoresEmpty />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-8">
          {data?.stores?.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}

function StoresGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-2 px-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StoresError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-destructive/20 bg-destructive/5 rounded-2xl">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
        <StoreIcon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to load stores</h3>
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

function StoresEmpty() {
  return (
    <Empty className="min-h-[400px] bg-muted/10 border-dashed border-2 rounded-2xl">
      <EmptyMedia variant="icon">
        <StoreIcon className="w-6 h-6" />
      </EmptyMedia>
      <EmptyContent>
        <EmptyTitle>No stores found</EmptyTitle>
        <EmptyDescription>
          You haven't created any stores yet. Add your first retail location to start generating receipts.
        </EmptyDescription>
        <div className="mt-4">
          <Button asChild className="gap-2 shadow-sm rounded-full">
            <Link href="/dashboard/stores/new">
              <Plus className="w-4 h-4" />
              Create Store
            </Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
