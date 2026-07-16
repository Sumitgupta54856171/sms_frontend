import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  ReceiptIndianRupee,
  Printer,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createInvoice,
  type InvoiceResponse,
} from "@/api/fee";

const FEE_TYPE_OPTIONS = [
  { value: "Tuition Fee", label: "Tuition Fee" },
  { value: "Admission Fee", label: "Admission Fee" },
  { value: "Development Fee", label: "Development Fee" },
  { value: "Library Fee", label: "Library Fee" },
  { value: "Sports Fee", label: "Sports Fee" },
  { value: "Computer Lab Fee", label: "Computer Lab Fee" },
  { value: "Science Lab Fee", label: "Science Lab Fee" },
  { value: "Medical Checkup", label: "Medical Checkup" },
  { value: "Miscellaneous", label: "Miscellaneous" },
];

interface InvoiceProps {
  student: {
    id: number;
    name: string;
    scholarNo: string;
    className: string;
    rollNo: string;
    enrollmentId?: number;
    sessionId?: number;
  };
  onClose: () => void;
}

export default function Invoice({ student, onClose }: InvoiceProps) {
  const [step, setStep] = useState<"form" | "receipt">("form");
  const [invoice, setInvoice] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "cash",
    feeType: "Tuition Fee",
    remarks: "",
  });
  const submittingRef = useRef(false);

  const invoiceMutation = useMutation({
    mutationFn: () => {
      const payload = {
        enrollmentId: student.enrollmentId ?? 0,
        paymentMethod: formData.paymentMethod,
        studentId: student.id,
        scholarNo: student.scholarNo,
        classNo: student.className,
        rollNo: student.rollNo,
        sessionId: student.sessionId ?? 1,
        amount: parseFloat(formData.amount),
        paymentType: formData.feeType,
        remarks: formData.remarks || undefined,
      };
      return createInvoice(payload);
    },
    onSuccess: (data) => {
        console.log("Invoice created successfully:", data);
      setInvoice(data);
      setStep("receipt");
      submittingRef.current = false;
    },
    onError: () => {
      submittingRef.current = false;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // prevent double submit
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    submittingRef.current = true;
    invoiceMutation.mutate();
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
            font-size: 11px;
            width: 72mm;
            margin: 0 auto;
            padding: 4mm 3mm;
            color: #000;
            line-height: 1.5;
          }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .border-dashed { border-style: dashed; }
          .border-black { border-color: #000; }
          .border-t { border-top-width: 1px; }
          .border-t-2 { border-top-width: 2px; }
          .border-t-3 { border-top-width: 3px; }
          .border-b { border-bottom-width: 1px; }
          .border-b-2 { border-bottom-width: 2px; }
          .my-1 { margin-top: 2px; margin-bottom: 2px; }
          .my-2 { margin-top: 4px; margin-bottom: 4px; }
          .my-3 { margin-top: 6px; margin-bottom: 6px; }
          .mb-1 { margin-bottom: 2px; }
          .mb-2 { margin-bottom: 4px; }
          .mb-3 { margin-bottom: 6px; }
          .mb-4 { margin-bottom: 8px; }
          .mt-1 { margin-top: 2px; }
          .mt-2 { margin-top: 4px; }
          .mt-3 { margin-top: 6px; }
          .mt-4 { margin-top: 8px; }
          .mt-6 { margin-top: 12px; }
          .text-xs { font-size: 10px; }
          .text-sm { font-size: 12px; }
          .text-base { font-size: 14px; }
          .text-lg { font-size: 16px; }
          .font-bold { font-weight: bold; }
          .font-normal { font-weight: normal; }
          .uppercase { text-transform: uppercase; }
          .tracking-tight { letter-spacing: -0.5px; }
          .tracking-widest { letter-spacing: 2px; }
          .tracking-wide { letter-spacing: 1px; }
          .leading-tight { line-height: 1.2; }
          .leading-relaxed { line-height: 1.6; }
          .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .pr-2 { padding-right: 4px; }
          .pl-2 { padding-left: 4px; }
          .px-1 { padding-left: 2px; padding-right: 2px; }
          .py-1 { padding-top: 2px; padding-bottom: 2px; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .h-6 { height: 12px; }
          .h-8 { height: 16px; }
          .text-gray-600 { color: #666; }
          .text-gray-400 { color: #999; }
          .text-\\[10px\\] { font-size: 9px; }
          .w-full { width: 100%; }
          .inline-block { display: inline-block; }
          .border-0 { border: none; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
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

  // ─── RECEIPT VIEW ────────────────────────────────────────────────────
  if (step === "receipt" && invoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-[340px] max-h-[90vh] overflow-y-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10 print:hidden">
            <h2 className="text-base font-semibold text-slate-900">Invoice</h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Thermal Receipt - 3 inch width */}
          <div className="p-3">
            <div id="thermal-receipt">
              <div className="text-center mb-3">
                <div className="text-lg font-bold uppercase tracking-wide leading-tight">Rose Convent High School</div>
                <div className="text-xs mt-1">Satna (M.P) - 485001</div>
                <div className="text-xs text-gray-600">Affiliated to M.P. Board</div>
              </div>

              <div className="border-t-2 border-dashed border-black my-2" />

              <div className="text-center font-bold uppercase text-sm tracking-widest py-1">Fee Receipt</div>

              <div className="border-t border-dashed border-black my-2" />

              <table>
                <tbody>
                  <tr>
                    <td className="text-xs text-gray-600" width="40%">Invoice No</td>
                    <td className="text-xs font-bold text-right" width="60%">{invoice.invoice_id}</td>
                  </tr>
                  <tr>
                    <td className="text-xs text-gray-600">Date</td>
                    <td className="text-xs font-bold text-right">{formatDate(invoice.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="text-xs text-gray-600">Student Name</td>
                    <td className="text-xs font-bold text-right uppercase">{student.name}</td>
                  </tr>
                  <tr>
                    <td className="text-xs text-gray-600">Class</td>
                    <td className="text-xs font-bold text-right">{invoice.enrollementSession.class_no}</td>
                  </tr>
                  <tr>
                    <td className="text-xs text-gray-600">Roll No</td>
                    <td className="text-xs font-bold text-right">{invoice.enrollementSession.roll_no}</td>
                  </tr>
                  <tr>
                    <td className="text-xs text-gray-600">Scholar No</td>
                    <td className="text-xs font-bold text-right">{invoice.scholar_no}</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-dashed border-black my-2" />

              <table>
                <tbody>
                  <tr>
                    <td className="text-xs font-bold" width="70%">Particulars</td>
                    <td className="text-xs font-bold text-right" width="30%">Amount</td>
                  </tr>
                  <tr>
                    <td className="text-xs py-1">{invoice.paymentType}</td>
                    <td className="text-xs font-bold text-right py-1">{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-dashed border-black my-2" />

              <table>
                <tbody>
                  <tr>
                    <td className="text-sm font-bold" width="70%">TOTAL (INR)</td>
                    <td className="text-sm font-bold text-right" width="30%">{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t-2 border-dashed border-black my-2" />

              <div className="text-xs text-center text-gray-600 mt-2 mb-2">
                Rupees {formatCurrency(invoice.amount)} Only
              </div>

              <div className="border-t border-dashed border-black my-2" />

              <div className="text-center mt-3">
                <div className="text-sm font-bold tracking-widest">*** THANK YOU ***</div>
                <div className="text-xs text-gray-400 mt-2">Computer Generated Receipt</div>
                <div className="text-xs text-gray-400">No signature required.</div>
              </div>

              <div className="h-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM VIEW ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 text-teal-700 rounded-md">
              <ReceiptIndianRupee className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Create Fee Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Student Name (read-only) */}
            <div>
              <Label className="mb-1.5 block">
                Student Name <span className="text-red-500">*</span>
              </Label>
              <Input value={student.name} disabled className="bg-slate-50" />
            </div>
            <div>
              <Label className="mb-1.5 block">
                Scholar No <span className="text-red-500">*</span>
              </Label>
              <Input value={student.scholarNo} disabled className="bg-slate-50" />
            </div>

            {/* Class (read-only) */}
            <div>
              <Label className="mb-1.5 block">
                Class <span className="text-red-500">*</span>
              </Label>
              <Input value={student.className} disabled className="bg-slate-50" />
            </div>

            {/* Fee Type */}
            <div>
              <Label htmlFor="feeType" className="mb-1.5 block">
                Fee Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.feeType}
                onValueChange={(v) => setFormData((p) => ({ ...p, feeType: v }))}
              >
                <SelectTrigger id="feeType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="mb-1.5 block">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-medium">
                  ₹
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  min="1"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="paymentMethod" className="mb-1.5 block">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, paymentMethod: v }))
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="online">Online Transfer</SelectItem>
                  <SelectItem value="dd">Demand Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div>
              <Label htmlFor="remarks" className="mb-1.5 block">
                Remarks (optional)
              </Label>
              <Input
                id="remarks"
                placeholder="Any notes..."
                value={formData.remarks}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, remarks: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Footer inside form */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-auto border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={invoiceMutation.isPending}
              className="w-full sm:w-auto bg-[#0d9488] hover:bg-teal-700 text-white gap-2"
            >
              {invoiceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Generate Invoice"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}