import React, { useRef, useState } from "react";
import { Download, Printer, CheckCircle2, Building, Receipt, MapPin, Phone, GraduationCap } from "lucide-react";
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

// --- MOCK INVOICE DATA ---
const invoiceData = {
  invoiceId: 100452,
  studentName: "Ashmin Sagar Mourya",
  invoiceDate: "2026-07-10T14:30:00", // LocalDateTime simulation
  paymentMethod: "UPI / Online",
  amount: 4500,
  schoolName: "Rose Convent High School",
  schoolAddress: "Delaura, Satna (M.P.)",
  contactInfo: "+91 9406780812",
  scholarNo: "EMP-2026-9",
  classInfo: "9TH",
};

export default function InvoiceTemplate() {
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef(null);

  // Note: For actual PDF download in a real app, you would use libraries like 'html2pdf.js' or 'jspdf'.
  // We use window.print() here as a reliable fallback that works everywhere.
  const handleDownloadPDF = () => {
    setIsDownloading(true);
    // Add a slight delay so button states can update before print window opens
    setTimeout(() => {
      window.print();
      setIsDownloading(false);
    }, 500);
  };

  // Format the LocalDateTime string
  const formattedDate = new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      
      {/* CSS for forcing clean print/pdf layout */}
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

      {/* --- ACTION BAR (Hidden in PDF/Print) --- */}
      <div id="print-action-bar" className="w-full max-w-[800px] mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" /> Invoice Preview
          </h2>
          <p className="text-xs text-slate-500">Verify details before downloading</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2 bg-white hover:bg-slate-50 text-slate-700">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2 bg-[#0d9488] hover:bg-teal-700 text-white shadow-md">
            {isDownloading ? (
               <span className="flex items-center gap-2">Downloading...</span>
            ) : (
               <><Download className="h-4 w-4" /> Download PDF</>
            )}
          </Button>
        </div>
      </div>

      {/* --- INVOICE DOCUMENT START --- */}
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
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                  {invoiceData.schoolName}
                </h1>
                <div className="flex flex-col mt-2 gap-1 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {invoiceData.schoolAddress}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {invoiceData.contactInfo}</span>
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="flex flex-col items-start sm:items-end">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Receipt / Invoice</div>
              <div className="text-2xl font-bold text-slate-800">#{invoiceData.invoiceId}</div>
              
              <div className="mt-4 flex flex-col gap-1 items-start sm:items-end">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> PAID
                </Badge>
                <span className="text-xs text-slate-500 font-medium mt-1">{formattedDate}</span>
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
              <h3 className="text-lg font-bold text-slate-800">{invoiceData.studentName}</h3>
              <div className="mt-1 space-y-0.5 text-sm font-medium text-slate-600">
                <p><span className="text-slate-400 w-20 inline-block">Scholar No:</span> {invoiceData.scholarNo}</p>
                <p><span className="text-slate-400 w-20 inline-block">Class/Sec:</span> {invoiceData.classInfo}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="sm:text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center sm:justify-end gap-1.5">
                 Payment Info
              </div>
              <div className="mt-1 space-y-0.5 text-sm font-medium text-slate-600">
                <p><span className="text-slate-400 mr-2">Method:</span> {invoiceData.paymentMethod}</p>
                <p><span className="text-slate-400 mr-2">Status:</span> Successful</p>
              </div>
            </div>
            
          </div>

          {/* FEE DETAILS TABLE */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="w-[50px] font-bold text-slate-600">#</TableHead>
                  <TableHead className="font-bold text-slate-600 uppercase text-xs tracking-wider">Fee Description</TableHead>
                  <TableHead className="text-right font-bold text-slate-600 uppercase text-xs tracking-wider">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-500">1</TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-800">Academic Fee Installment</div>
                    <div className="text-xs text-slate-500 mt-0.5">Session 2026-2027</div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-700">
                    ₹ {invoiceData.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
                {/* Add more rows if needed here */}
              </TableBody>
            </Table>
            
            {/* Total Calculation Section */}
            <div className="bg-slate-50 p-6 flex justify-end">
              <div className="w-full max-w-[300px] space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Subtotal</span>
                  <span>₹ {invoiceData.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Late Fine</span>
                  <span>₹ 0.00</span>
                </div>
                <div className="w-full border-t border-slate-200 my-2"></div>
                <div className="flex justify-between text-lg font-black text-indigo-700">
                  <span>Total Amount</span>
                  <span>₹ {invoiceData.amount.toFixed(2)}</span>
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
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Authorized Signatory</p>
            </div>
          </div>

        </div>
      </Card>
      {/* --- INVOICE DOCUMENT END --- */}

    </div>
  );
}