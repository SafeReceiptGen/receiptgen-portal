import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border bg-card p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-3 h-8 w-20" />
                <Skeleton className="mt-6 h-4 w-40" />
              </div>
            ))}
          </div>
          <div className="px-4 lg:px-6">
            <div className="rounded-xl border bg-card p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
              <Skeleton className="mt-6 h-56 w-full" />
            </div>
          </div>
          <div className="px-4 lg:px-6">
            <div className="rounded-xl border bg-card px-5 py-4">
              <Skeleton className="h-4 w-16" />
              <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-7 w-12" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
