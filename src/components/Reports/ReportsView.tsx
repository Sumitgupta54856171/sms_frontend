import React, { useState, useMemo } from "react";
import {
  FileText,
  Calendar,
  Users,
  GraduationCap,
  Wallet,
  ClipboardList,
  Bell,
  PartyPopper,
  Search,
  Loader2,
  FileSpreadsheet,
  Database,
  Printer,
  X,
  CheckCircle2,
  Filter,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/store/hooks";
import { fetchReportData, type ReportType } from "@/api/reports";
import { toast } from "sonner";

type ReportFormat = "pdf" | "excel" | "sql";

type ReportCategory =
  | "session"
  | "attendance"
  | "fees"
  | "students"
  | "teachers"
  | "exams"
  | "notices"
  | "events";

interface ReportTypeMeta {
  id: ReportCategory;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

interface Column {
  key: string;
  label: string;
}

const reportTypes: ReportTypeMeta[] = [
  {
    id: "session",
    title: "Session Report",
    description: "Complete overview of the active academic session.",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: "attendance",
    title: "Attendance Report",
    description: "Daily and monthly student attendance summaries.",
    icon: ClipboardList,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    id: "fees",
    title: "Fees Report",
    description: "Fee collection, pending dues and invoice records.",
    icon: Wallet,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    id: "students",
    title: "Students Report",
    description: "Enrolled students with class and contact details.",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    id: "teachers",
    title: "Teachers Report",
    description: "Staff list, subjects and employment status.",
    icon: GraduationCap,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    id: "exams",
    title: "Exam Report",
    description: "Exam schedules, subjects and result summaries.",
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    id: "notices",
    title: "Notices Report",
    description: "All published notices and announcements.",
    icon: Bell,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  {
    id: "events",
    title: "Events Report",
    description: "School events, venues and dates.",
    icon: PartyPopper,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-200",
  },
];

const filterConfig: Record<string, { label: string; color: string }> = {
  all: { label: "All Reports", color: "bg-slate-900" },
  session: { label: "Session", color: "bg-blue-600" },
  attendance: { label: "Attendance", color: "bg-emerald-600" },
  fees: { label: "Fees", color: "bg-amber-600" },
  students: { label: "Students", color: "bg-violet-600" },
  teachers: { label: "Teachers", color: "bg-rose-600" },
  exams: { label: "Exams", color: "bg-indigo-600" },
  notices: { label: "Notices", color: "bg-cyan-600" },
  events: { label: "Events", color: "bg-fuchsia-600" },
};

function sanitizeSqlValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadExcel(columns: Column[], rows: Record<string, string | number>[], filename: string) {
  const header = columns.map((c) => c.label).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.key];
          const str = val === null || val === undefined ? "" : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
  const csv = "\uFEFF" + header + "\n" + body;
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

function downloadSQL(tableName: string, columns: Column[], rows: Record<string, string | number>[], filename: string) {
  const colNames = columns.map((c) => c.key).join(", ");
  const inserts = rows
    .map((row) => {
      const values = columns.map((c) => sanitizeSqlValue(row[c.key])).join(", ");
      return `INSERT INTO ${tableName} (${colNames}) VALUES (${values});`;
    })
    .join("\n");
  const sql = `-- Report generated on ${new Date().toLocaleString()}\n-- Table: ${tableName}\n\n${inserts}\n`;
  downloadFile(sql, filename, "text/sql");
}

function downloadPDF(title: string, columns: Column[], rows: Record<string, string | number>[], filename: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const rowsHtml = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
          h1 { font-size: 22px; margin-bottom: 6px; }
          .meta { color: #64748b; font-size: 12px; margin-bottom: 18px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; font-weight: 600; }
          tr:nth-child(even) { background: #f8fafc; }
          .footer { margin-top: 18px; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated on ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="footer">School Management System &bull; Reports Module</div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 300); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export default function ReportsView() {
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const [selectedReport, setSelectedReport] = useState<ReportCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<ReportFormat | null>(null);
  const [lastDownload, setLastDownload] = useState<{ title: string; format: ReportFormat } | null>(null);

  const filteredReports = useMemo(() => {
    if (selectedReport === "all") return reportTypes;
    return reportTypes.filter((r) => r.id === selectedReport);
  }, [selectedReport]);

  const searchedReports = useMemo(() => {
    if (!search.trim()) return filteredReports;
    const q = search.toLowerCase();
    return filteredReports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [filteredReports, search]);

  const handleDownload = async (report: ReportTypeMeta, format: ReportFormat) => {
    setDownloading(format);
    try {
      const { columns, rows } = await fetchReportData(report.id as ReportType);
      const tableName = `${report.id}_report`;
      const safeDate = new Date().toISOString().split("T")[0];
      const filenameBase = `${report.title.replace(/\s+/g, "_")}_${safeDate}`;

      if (rows.length === 0) {
        toast.info(`No data available for ${report.title}.`);
      }

      if (format === "excel") {
        downloadExcel(columns, rows, `${filenameBase}.csv`);
      } else if (format === "sql") {
        downloadSQL(tableName, columns, rows, `${filenameBase}.sql`);
      } else if (format === "pdf") {
        downloadPDF(report.title, columns, rows, `${filenameBase}.pdf`);
      }

      setLastDownload({ title: report.title, format });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to download report";
      toast.error(message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
                <FileText className="h-3.5 w-3.5" />
                Reports Center
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                School Reports
              </h1>
              <p className="text-base text-slate-500 mt-2 leading-relaxed">
                Generate, preview and download institutional reports. Export to PDF for printing, Excel for analysis, or SQL for backups.
              </p>
            </div>
            {currentSession?.sessionName && (
              <Badge
                variant="outline"
                className="bg-white border-slate-200 text-slate-700 px-3 py-1.5 text-xs font-medium"
              >
                Session: {currentSession.sessionName}
              </Badge>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search reports by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-200 focus-visible:ring-blue-400 focus-visible:ring-offset-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={selectedReport} onValueChange={(v) => setSelectedReport(v as ReportCategory | "all")}>
              <SelectTrigger className="w-[220px] h-11 bg-white border-slate-200">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="session">Session Report</SelectItem>
                <SelectItem value="attendance">Attendance Report</SelectItem>
                <SelectItem value="fees">Fees Report</SelectItem>
                <SelectItem value="students">Students Report</SelectItem>
                <SelectItem value="teachers">Teachers Report</SelectItem>
                <SelectItem value="exams">Exam Report</SelectItem>
                <SelectItem value="notices">Notices Report</SelectItem>
                <SelectItem value="events">Events Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Last download toast */}
        {lastDownload && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">
              Downloaded {lastDownload.title} as{" "}
              {lastDownload.format === "excel" ? "Excel" : lastDownload.format.toUpperCase()}
            </span>
            <button
              onClick={() => setLastDownload(null)}
              className="ml-auto text-emerald-700 hover:text-emerald-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Reports grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {searchedReports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="group border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl border ${report.bg} ${report.border} ${report.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-medium"
                    >
                      {report.id}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 mt-4">
                    {report.title}
                  </CardTitle>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {report.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2">
                    <DownloadButton
                      report={report}
                      format="pdf"
                      icon={Printer}
                      label="PDF"
                      downloading={downloading}
                      onDownload={handleDownload}
                    />
                    <DownloadButton
                      report={report}
                      format="excel"
                      icon={FileSpreadsheet}
                      label="Excel"
                      downloading={downloading}
                      onDownload={handleDownload}
                    />
                    <DownloadButton
                      report={report}
                      format="sql"
                      icon={Database}
                      label="SQL"
                      downloading={downloading}
                      onDownload={handleDownload}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {searchedReports.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No reports found</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search or filter to find the report you need.
            </p>
          </div>
        )}

        {/* Quick tip */}
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <ChevronRight className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Need a custom report?</h4>
            <p className="text-sm text-slate-500 mt-1">
              Contact the admin team to add new report templates or connect live backend data to these exports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadButton({
  report,
  format,
  icon: Icon,
  label,
  downloading,
  onDownload,
}: {
  report: ReportTypeMeta;
  format: ReportFormat;
  icon: React.ElementType;
  label: string;
  downloading: ReportFormat | null;
  onDownload: (report: ReportTypeMeta, format: ReportFormat) => void;
}) {
  const isBusy = downloading === format;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onDownload(report, format)}
      disabled={!!downloading}
      className={`w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all ${
        isBusy ? "opacity-80 cursor-wait" : ""
      }`}
    >
      {isBusy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5 mr-1.5" />
      )}
      <span className="text-xs">{isBusy ? "..." : label}</span>
    </Button>
  );
}
