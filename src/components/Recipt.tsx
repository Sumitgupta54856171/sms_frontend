import React, { useState } from 'react';
import { X, ReceiptIndianRupee, Printer, ArrowLeft, GraduationCap } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null); // Stores data to show preview

  // Labels for Fee Types to show nice text in Invoice instead of values
  const feeTypeLabels = {
    admission: 'Admission_Fees',
    installment: 'Installment_Payments',
    exam: 'Exam_Fees',
    monthly: 'Monthly_Fees',
    library: 'Library_Fees',
    other: 'Other_Miscellaneous',
  };

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Generate a random receipt number for realism
    data.receiptNo = `RCPT-${Math.floor(Math.random() * 90000) + 10000}`;
    
    setInvoiceData(data);
  };

  const handlePrint = () => {
    window.print();
  };

  const closeApp = () => {
    setIsOpen(false);
    setInvoiceData(null);
  };

  // Background UI simulation when modal is closed
  if (!isOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 print:hidden">
        <Button onClick={() => setIsOpen(true)} className="bg-[#0d9488] hover:bg-teal-700 text-white">Create New Invoice</Button>
      </div>
    );
  }

  if (invoiceData) {
    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0 flex flex-col items-center">
        
        {/* Top Action Bar (Hidden in Print) */}
        <div className="w-full max-w-sm mb-6 flex items-center justify-between print:hidden">
          <Button variant="ghost" onClick={() => setInvoiceData(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={closeApp}>Close</Button>
            <Button size="sm" onClick={handlePrint} className="gap-2 bg-[#0d9488] hover:bg-teal-700 text-white">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        {/* --- THERMAL INVOICE PAPER DESIGN --- */}
        <div className="w-full max-w-[320px] bg-white p-4 shadow-lg border border-slate-200 font-mono text-black print:shadow-none print:border-none print:p-0 print:max-w-full">
          
          {/* Header Section */}
          <div className="text-center mb-4">
            <h1 className="font-bold text-[1.1rem] leading-tight uppercase tracking-tight">Rose Convent High School</h1>
            <p className="text-xs mt-1">123 Education Lane, Knowledge Pk</p>
            <p className="text-xs">Delaura,Satna (M.P)</p>
            <p className="text-xs">Pincode - 485001 </p>

          </div>

          <div className="border-t-2 border-dashed border-black my-2"></div>
          <div className="text-center font-bold uppercase text-sm tracking-widest">Fee Receipt</div>
          <div className="border-t-2 border-dashed border-black my-2"></div>

          {/* Details Section */}
          <div className="flex justify-between text-xs mb-1.5">
            <span>Rcpt No:</span>
            <span className="font-bold">{invoiceData.receiptNo}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Date:</span>
            <span>{new Date(invoiceData.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Student:</span>
            <span className="font-bold text-right truncate pl-2">{invoiceData.studentName.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Class:</span>
            <span>{invoiceData.class}</span>
          </div>
          <div className="flex justify-between text-xs mb-3">
            <span>Sch. No:</span>
            <span>{invoiceData.schoolNo}</span>
          </div>

          <div className="border-t-2 border-dashed border-black my-2"></div>
          
          {/* Table Header */}
          <div className="flex justify-between text-xs font-bold mb-2">
            <span>Particulars</span>
            <span>Amount</span>
          </div>
          
          {/* Item Row */}
          <div className="flex justify-between text-xs mb-2">
            <span className="pr-4">{feeTypeLabels[invoiceData.feeType] || invoiceData.feeType}</span>
            <span>{parseFloat(invoiceData.amount).toFixed(2)}</span>
          </div>

          <div className="border-t-2 border-dashed border-black my-2"></div>

          {/* Total Amount */}
          <div className="flex justify-between text-base font-bold mt-3 mb-3">
            <span>TOTAL (INR)</span>
            <span>{parseFloat(invoiceData.amount).toFixed(2)}</span>
          </div>

          <div className="border-t-2 border-dashed border-black my-2"></div>
          
          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm font-bold">*** THANK YOU ***</p>
            <p className="mt-3 text-[10px] text-gray-600 print:text-black">Computer Generated Receipt</p>
            <p className="text-[10px] text-gray-600 print:text-black">No signature required.</p>
          </div>
          
          {/* Extra space for thermal printer to tear easily */}
          <div className="h-8 print:h-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans print:hidden">
      {/* Dialog Container */}
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
            onClick={closeApp}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body - We wrap it in a real HTML <form> to handle submission */}
        <form id="invoice-form" onSubmit={handleGenerateInvoice} className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Row 1 */}
            <div>
              <Label htmlFor="studentName" className="mb-1.5 block">Student Name <span className="text-red-500">*</span></Label>
              <Input id="studentName" name="studentName" placeholder="Enter student's name" required />
            </div>
            <div>
              <Label htmlFor="schoolNo" className="mb-1.5 block">School No / Scholar No <span className="text-red-500">*</span></Label>
              <Input id="schoolNo" name="schoolNo" placeholder="e.g. SCH-2023-101" required />
            </div>

            {/* Row 2 */}
            <div>
              <Label htmlFor="class" className="mb-1.5 block">Grade <span className="text-red-500">*</span></Label>
              <Select name="class" required>
                <SelectTrigger id="class"><SelectValue placeholder="Select Grade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nursery">Nursery</SelectItem>
                  <SelectItem value="kg">KG</SelectItem>
                  <SelectItem value="1">Grade 1</SelectItem>
                  <SelectItem value="2">Grade 2</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="4">Grade 4</SelectItem>
                  <SelectItem value="5">Grade 5</SelectItem>
                  <SelectItem value="6">Grade 6</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feeType" className="mb-1.5 block">Fee Type <span className="text-red-500">*</span></Label>
              <Select name="feeType" required>
                <SelectTrigger id="feeType"><SelectValue placeholder="Select Fee Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admission">Admission Fees</SelectItem>
                  <SelectItem value="installment">Tuition / Installment Payments</SelectItem>
                  <SelectItem value="exam">Exam Fees</SelectItem>
                  <SelectItem value="transport">Transportation / Bus Fees</SelectItem>
                  <SelectItem value="annual">Annual Charges</SelectItem>
                  <SelectItem value="library">Library Fees</SelectItem>
                  <SelectItem value="hostel">Hostel / Mess Fees</SelectItem>
                  <SelectItem value="late_fine">Late Payment Fine</SelectItem>
                  <SelectItem value="other">Other Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 3 */}
            <div>
              <Label htmlFor="amount" className="mb-1.5 block">Amount <span className="text-red-500">*</span></Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 font-medium">
                  ₹
                </div>
                <Input 
                  id="amount" 
                  name="amount"
                  type="number" 
                  placeholder="0.00" 
                  className="pl-8" 
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date" className="mb-1.5 block">Date <span className="text-red-500">*</span></Label>
              <Input id="date" name="date" type="date" className="block w-full" required />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button variant="outline" onClick={closeApp} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" form="invoice-form" className="w-full sm:w-auto bg-[#0d9488] hover:bg-teal-700 text-white">
            Generate Invoice
          </Button>
        </div>

      </div>
    </div>
  );
}