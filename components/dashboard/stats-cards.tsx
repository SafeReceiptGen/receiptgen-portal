import { Receipt, Return } from "@/types/retailers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  receipts: Receipt[];
  returns: Return[];
}

export function StatsCards({ receipts, returns }: StatsCardsProps) {
  const totalRevenue = receipts.reduce((sum, r) => sum + r.total, 0);
  const pendingReturns = returns.filter((r) => r.status === "pending").length;
  const approvedReturns = returns.filter((r) => r.status === "approved").length;
  const rejectedReturns = returns.filter((r) => r.status === "rejected").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Receipts</p>
              <p className="text-2xl font-bold">{receipts.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
              <p className="text-2xl font-bold">GHS {totalRevenue.toFixed(0)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pending Returns</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{pendingReturns}</p>
                {pendingReturns > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Action needed
                  </Badge>
                )}
              </div>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Approved Returns</p>
              <p className="text-2xl font-bold">{approvedReturns}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600/50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
