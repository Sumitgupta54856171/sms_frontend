import { FileSpreadsheet } from "lucide-react";
import ReportCard from "@/components/Fees/ReportCard";

export default function ReportCardPage() {
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Page Header (hidden in print) */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Report Card</h1>
            <p className="text-sm text-slate-500">
              Enter marks to generate a printable report card
            </p>
          </div>
        </div>
      </div>
      <ReportCard />
    </div>
  );
}
