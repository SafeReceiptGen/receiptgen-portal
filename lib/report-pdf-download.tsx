import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "@/components/dashboard/reports/report-pdf";
import type { ReportSummary } from "@/lib/api";

export async function downloadReportPdf(opts: {
  data: ReportSummary;
  title: string;
  rangeLabel: string;
  insight: string;
  filename: string;
}): Promise<void> {
  const blob = await pdf(
    <ReportPDF
      data={opts.data}
      title={opts.title}
      rangeLabel={opts.rangeLabel}
      insight={opts.insight}
    />,
  ).toBlob();

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = opts.filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
