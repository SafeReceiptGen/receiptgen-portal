import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
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