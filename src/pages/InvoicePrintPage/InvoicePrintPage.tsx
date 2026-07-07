import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft, Loader2, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchInvoiceById } from "@/api/fee";

export default function InvoicePrintPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => fetchInvoiceById(Number(invoiceId)),
    enabled: !!invoiceId,
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !invoice) return;

    const content = document.getElementById("thermal-receipt")?.innerHTML ?? "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoice.invoiceNo}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            width: 72mm;
            margin: 0 auto;
            padding: 5mm 3mm;
            color: #000;
            line-height: 1.4;
          }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .border-dashed { border-style: dashed; }
          .border-black { border-color: #000; }
          .border-t-2 { border-top-width: 2px; }
          .my-2 { margin-top: 4px; margin-bottom: 4px; }
          .mb-4 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 6px; }
          .mb-2 { margin-bottom: 4px; }
          .mb-1\\.5 { margin-bottom: 3px; }
          .mt-3 { margin-top: 6px; }
          .mt-6 { margin-top: 12px; }
          .text-xs { font-size: 10px; }
          .text-sm { font-size: 11px; }
          .text-base { font-size: 13px; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .tracking-tight { letter-spacing: -0.5px; }
          .tracking-widest { letter-spacing: 2px; }
          .leading-tight { line-height: 1.2; }
          .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .pr-2 { padding-right: 4px; }
          .pl-2 { padding-left: 4px; }
          .text-right { text-align: right; }
          .h-8 { height: 16px; }
          .text-gray-600 { color: #666; }
          .text-\\[10px\\] { font-size: 9px; }
        </style>
      </head>
      <body>
        ${content}
        <script>window.onload=function(){window.print();window.close()}<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm">
          <FileX className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Invoice Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            The invoice you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" onClick={() => navigate("/fees")}>
            Back to Fees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0 print:m-0">
      {/* Toolbar — hidden when printing */}
      <div className="max-w-sm mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handlePrint}
          className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      {/* Thermal Receipt */}
      <div className="max-w-[320px] mx-auto bg-white p-4 shadow-lg border border-slate-200 font-mono text-black print:shadow-none print:border-none print:p-0 print:max-w-full">
        <div id="thermal-receipt">
          {/* School Header */}
          <div className="text-center mb-4">
            <h1 className="font-bold text-[1.1rem] leading-tight uppercase tracking-tight">
              Rose Convent High School
            </h1>
            <p className="text-xs mt-1">123 Education Lane, Knowledge Pk</p>
            <p className="text-xs">City - 400001</p>
            <p className="text-xs">Ph: +91-9876543210</p>
          </div>

          <div className="border-t-2 border-dashed border-black my-2" />
          <div className="text-center font-bold uppercase text-sm tracking-widest">
            Fee Receipt
          </div>
          <div className="border-t-2 border-dashed border-black my-2" />

          {/* Invoice Details */}
          <div className="flex justify-between text-xs mb-1.5">
            <span>Invoice No:</span>
            <span className="font-bold">{invoice.invoiceNo}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Date:</span>
            <span>{formatDate(invoice.createdAt)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Student ID:</span>
            <span>{invoice.studentId}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Class:</span>
            <span>{invoice.classNo}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Roll No:</span>
            <span>{invoice.rollNo}</span>
          </div>
          <div className="flex justify-between text-xs mb-3">
            <span>Sch. No:</span>
            <span>{invoice.scholarNo}</span>
          </div>

          <div className="border-t-2 border-dashed border-black my-2" />

          {/* Amount Table */}
          <div className="flex justify-between text-xs font-bold mb-2">
            <span>Particulars</span>
            <span>Amount</span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span className="pr-4">{invoice.paymentType}</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>

          <div className="border-t-2 border-dashed border-black my-2" />

          <div className="flex justify-between text-base font-bold mt-3 mb-3">
            <span>TOTAL (INR)</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>

          <div className="border-t-2 border-dashed border-black my-2" />

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm font-bold">*** THANK YOU ***</p>
            <p className="mt-3 text-[10px] text-gray-600">
              Computer Generated Receipt
            </p>
            <p className="text-[10px] text-gray-600">
              No signature required.
            </p>
          </div>

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
