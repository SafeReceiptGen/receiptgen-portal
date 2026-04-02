import { StoreFormClient } from "./store-form-client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Add New Store",
  description: "Create a new store location and define its return policy.",
};

export default function NewStorePage() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/stores">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Stores
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Add New Store
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new store location. You can customize the return policy specifically for this location.
        </p>
      </div>

      <StoreFormClient />
    </div>
  );
}
