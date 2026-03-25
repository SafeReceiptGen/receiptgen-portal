"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ReceiptSearchFilter } from "@/components/dashboard/search-filter";
import { ResponsiveReceipts } from "@/components/dashboard/responsive-receipts";
import { ResponsiveReturns } from "@/components/dashboard/responsive-returns";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getReceiptsByRetailerId,
  getReturnsByRetailerId,
  MOCK_RETAILERS,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const [selectedRetailerId, setSelectedRetailerId] = useState(
    MOCK_RETAILERS[0]?.id || "retailer-001"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const receipts = getReceiptsByRetailerId(selectedRetailerId);
  const returns = getReturnsByRetailerId(selectedRetailerId);

  const handleRetailerChange = (retailerId: string) => {
    setSelectedRetailerId(retailerId);
    setSearchQuery("");
    setStatusFilter("");
  };

  const handleApproveReturn = (returnId: string) => {
    console.log("Approving return:", returnId);
    // In a real app, this would update the backend
  };

  const handleRejectReturn = (returnId: string, reason: string) => {
    console.log("Rejecting return:", returnId, "Reason:", reason);
    // In a real app, this would update the backend
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <DashboardSidebar
          selectedRetailerId={selectedRetailerId}
          onRetailerChange={handleRetailerChange}
        />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Receipt Management
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your store receipts and return requests
                </p>
              </div>
            </div>

            <StatsCards receipts={receipts} returns={returns} />

            <Tabs defaultValue="receipts" className="w-full">

              <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
                <TabsTrigger value="returns">Returns Review</TabsTrigger>
              </TabsList>

              <TabsContent value="receipts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                    <CardDescription>
                      Find receipts by ID, customer, phone, or item name
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReceiptSearchFilter
                      onSearchChange={setSearchQuery}
                      onStatusChange={setStatusFilter}
                      onClear={() => {
                        setSearchQuery("");
                        setStatusFilter("");
                      }}
                      receipts={receipts}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>All Receipts</CardTitle>
                    <CardDescription>
                      View and manage all issued receipts for your store
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveReceipts
                      receipts={receipts}
                      searchQuery={searchQuery}
                      statusFilter={statusFilter}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="returns" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Return Requests</CardTitle>
                    <CardDescription>
                      Review and approve/reject return and exchange requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveReturns
                      returns={returns}
                      onApprove={handleApproveReturn}
                      onReject={handleRejectReturn}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
