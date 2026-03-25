import { Receipt, Return } from "@/types/retailers";
import { Badge } from "@/components/ui/badge";

export function ReceiptStatusBadge({
  status,
}: {
  status: Receipt["status"];
}) {
  const statusConfig = {
    issued: {
      label: "Issued",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    pending_return: {
      label: "Pending Return",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    returned: {
      label: "Returned",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    exchanged: {
      label: "Exchanged",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    },
  };

  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}

export function ReturnStatusBadge({
  status,
}: {
  status: Return["status"];
}) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    approved: {
      label: "Approved",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    completed: {
      label: "Completed",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
  };

  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
