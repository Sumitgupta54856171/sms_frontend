import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Printer,
  ArrowLeft,
  Loader2,
  FileX,
  Download,
  GraduationCap,
  MapPin,
  Phone,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
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
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center font-sans">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-document, #invoice-document * { visibility: visible; }
          #invoice-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-action-bar { display: none !important; }
        }
      `}} />

      {/* Action Bar — hidden when printing */}
      <div
        id="print-action-bar"
        className="w-full max-w-[800px] mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200"
      >
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" /> Invoice Preview
          </h2>
          <p className="text-xs text-slate-500">Verify details before printing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} className="gap-2 bg-[#0d9488] hover:bg-teal-700 text-white shadow-md">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <Card
        id="invoice-document"
        className="w-full max-w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 p-0"
      >
        {/* Top Colored Band */}
        <div className="h-3 w-full bg-[#0d9488]"></div>

        <div className="p-8 sm:p-12">
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 pb-8 mb-8 gap-6">
            {/* School Branding */}
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                  Rose Convent High School
                </h1>
                <div className="flex flex-col mt-2 gap-1 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Delaura, Satna (M.P.)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> +91 9406780812
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="flex flex-col items-start sm:items-end">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                Receipt / Invoice
              </div>
              <div className="text-2xl font-bold text-slate-800">#{invoice.invoiceId}</div>

              <div className="mt-4 flex flex-col gap-1 items-start sm:items-end">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1 font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> PAID
                </Badge>
                <span className="text-xs text-slate-500 font-medium mt-1">
                  {formatDateTime(invoice.invoiceDate)}
                </span>
              </div>
            </div>
          </div>

          {/* BILLING ENTITIES */}
          <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10 bg-slate-50 p-6 rounded-xl border border-slate-100">
            {/* Billed To (Student) */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                Billed To
              </div>
              <h3 className="text-lg font-bold text-slate-800">{invoice.studentName}</h3>
              <div className="mt-1 space-y-0.5 text-sm font-medium text-slate-600">
                <p>
                  <span className="text-slate-400 w-20 inline-block">Invoice ID:</span> #{invoice.invoiceId}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="sm:text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center sm:justify-end gap-1.5">
                Payment Info
              </div>
              <div className="mt-1 space-y-0.5 text-sm font-medium text-slate-600">
                <p>
                  <span className="text-slate-400 mr-2">Method:</span> {invoice.paymentMethod}
                </p>
                <p>
                  <span className="text-slate-400 mr-2">Status:</span> Successful
                </p>
              </div>
            </div>
          </div>

          {/* FEE DETAILS TABLE */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="w-[50px] font-bold text-slate-600">#</TableHead>
                  <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">
                    Fee Description
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-600 uppercase text-xs tracking-wider">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-500">1</TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-800">Fee Payment</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Paid via {invoice.paymentMethod}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-700">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Total Calculation Section */}
            <div className="bg-slate-50 p-6 flex justify-end">
              <div className="w-full max-w-[300px] space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Late Fine</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="w-full border-t border-slate-200 my-2"></div>
                <div className="flex justify-between text-lg font-black text-indigo-700">
                  <span>Total Amount</span>
                  <span>{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER & SIGNATURE */}
          <div className="flex flex-col sm:flex-row justify-between items-end mt-16 pt-8 border-t border-slate-100">
            <div className="text-xs text-slate-400 font-medium max-w-[300px]">
              <p>This is a computer-generated receipt and does not require a physical signature.</p>
              <p className="mt-1 text-indigo-600 font-semibold">Thank you for your payment!</p>
            </div>

            <div className="text-center mt-8 sm:mt-0">
              <div className="w-48 border-t-[1.5px] border-slate-400 mb-2"></div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
