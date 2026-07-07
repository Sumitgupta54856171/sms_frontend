import { FileText } from "lucide-react";
import TCForm from "@/components/TC";

export default function TCPage() {
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Transfer Certificate</h1>
            <p className="text-sm text-slate-500">
              Fill in the details to generate a Transfer Certificate
            </p>
          </div>
        </div>
      </div>
      <TCForm />
    </div>
  );
}
