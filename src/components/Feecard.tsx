
import { Printer, GraduationCap, Phone, MapPin, CalendarDays, User, Hash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FeeCard() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans print:p-0 print:bg-white">
      
      {/* Action Bar (Hidden in Print) */}
      <div className="w-full max-w-5xl flex justify-end mb-6 print:hidden">
        <Button onClick={handlePrint} className="gap-2 bg-[#0d9488] hover:bg-teal-700 text-white shadow-md rounded-full px-6">
          <Printer className="h-4 w-4" /> Print Fee Card
        </Button>
      </div>

      {/* --- MODERN FEE CARD START --- */}
      <div 
        id="fee-card-container" 
        className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 text-slate-900 print:shadow-none print:border-none print:rounded-none print:p-0 print:max-w-full"
      >
        
        {}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          
          <div className="flex items-center gap-5">
            {/* Modern Logo Icon */}
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-8 w-8" />
            </div>
            
            {/* School Info */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                Rose Convent High School
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Delaura, Satna (M.P.)</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 9406780812 / 8770986315</span>
              </div>
            </div>
          </div>

          {/* Document Type Badge */}
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 tracking-wide uppercase">
              Academic Fee Record
            </span>
            <span className="text-xs text-slate-400 mt-2 font-medium">Session: 2026-2027</span>
          </div>

        </div>

        {}
        <div className="bg-slate-50 rounded-xl p-6 mb-10 border border-slate-100 print:bg-transparent print:border-slate-200 print:p-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> Student Details
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
            {/* Scholar No */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Scholar No.</Label>
              <Input 
                placeholder="Enter Scholar No." 
                className="h-9 bg-white border-slate-200 focus-visible:ring-indigo-500 print:bg-transparent print:border-b print:border-x-0 print:border-t-0 print:border-slate-300 print:rounded-none print:px-0 print:shadow-none placeholder:print:text-transparent font-medium" 
              />
            </div>
            
            {/* Class */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Class</Label>
              <Input 
                placeholder="Enter Class" 
                className="h-9 bg-white border-slate-200 focus-visible:ring-indigo-500 print:bg-transparent print:border-b print:border-x-0 print:border-t-0 print:border-slate-300 print:rounded-none print:px-0 print:shadow-none placeholder:print:text-transparent font-medium" 
              />
            </div>

            {/* Section */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Section</Label>
              <Input 
                placeholder="Enter Section" 
                className="h-9 bg-white border-slate-200 focus-visible:ring-indigo-500 print:bg-transparent print:border-b print:border-x-0 print:border-t-0 print:border-slate-300 print:rounded-none print:px-0 print:shadow-none placeholder:print:text-transparent font-medium" 
              />
            </div>

            {/* Mobile No */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Mobile No.</Label>
              <Input 
                placeholder="Enter Mobile No." 
                className="h-9 bg-white border-slate-200 focus-visible:ring-indigo-500 print:bg-transparent print:border-b print:border-x-0 print:border-t-0 print:border-slate-300 print:rounded-none print:px-0 print:shadow-none placeholder:print:text-transparent font-medium" 
              />
            </div>

            {/* Student Name */}
            <div className="md:col-span-2">
              <Label className="text-xs text-slate-500 mb-1.5 block">Student Full Name</Label>
              <Input 
                placeholder="Enter Student Name" 
                className="h-9 bg-white border-slate-200 focus-visible:ring-indigo-500 print:bg-transparent print:border-b print:border-x-0 print:border-t-0 print:border-slate-300 print:rounded-none print:px-0 print:shadow-none placeholder:print:text-transparent font-medium" 
              />
            </div>

            {/* Father's Name */}
            <div className="md:col-span-2">
              <Label className="text-xs text-slate-500 mb-1.5 block">Father's Name</Label>
              <Input 
                placeholder="Enter Father's Name" 
                className="h-9 bg-white border-slate-200 focus-visible:ring-indigo-500 print:bg-transparent print:border-b print:border-x-0 print:border-t-0 print:border-slate-300 print:rounded-none print:px-0 print:shadow-none placeholder:print:text-transparent font-medium" 
              />
            </div>
          </div>
        </div>

        {}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Fee Installment Schedule
          </h2>
          
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 print:bg-slate-100">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 h-12 w-[180px]">Fee Head</TableHead>
                  <TableHead className="font-semibold text-slate-700">Month</TableHead>
                  <TableHead className="font-semibold text-slate-700">Amount Received</TableHead>
                  <TableHead className="font-semibold text-slate-700">Receipt No.</TableHead>
                  <TableHead className="font-semibold text-slate-700">Date</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right pr-6">Signature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { head: "Annual Fees", color: "text-indigo-600" },
                  { head: "First Installment", color: "text-slate-700" },
                  { head: "Second Installment", color: "text-slate-700" },
                  { head: "Third Installment", color: "text-slate-700" }
                ].map((item, index) => (
                  <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50/50 print:hover:bg-transparent transition-colors">
                    <TableCell className={`font-semibold ${item.color} py-4`}>
                      {item.head}
                    </TableCell>
                    <TableCell className="p-2">
                      <Input className="h-10 bg-transparent border-2 hover:border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500 print:border-b print:border-slate-200 print:rounded-none shadow-none text-sm placeholder:text-slate-300 placeholder:print:text-transparent"  />
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm print:hidden">₹</span>
                        <Input className="h-10 bg-transparent border-2 hover:border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500 pl-7 print:pl-0 print:border-b print:border-slate-200 print:rounded-none shadow-none text-sm font-medium placeholder:text-slate-300 placeholder:print:text-transparent"  />
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <Input className="h-10 bg-transparent border-2 hover:border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500 print:border-b print:border-slate-200 print:rounded-none shadow-none text-sm font-mono placeholder:text-slate-300 placeholder:print:text-transparent"  />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input type="text" className="h-10 bg-transparent border-2 hover:border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500 print:border-b print:border-slate-200 print:rounded-none shadow-none text-sm text-slate-600" />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input className="h-10 bg-transparent border-2 hover:border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500 print:border-b print:border-slate-200 print:rounded-none shadow-none text-sm text-right pr-4 placeholder:text-slate-300 placeholder:print:text-transparent border-2"  />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {}
        <div className="mt-16 pt-8 flex justify-between items-end px-4 border-t border-slate-100 print:border-slate-200">
          <div className="text-center">
            <div className="w-48 border-t border-slate-300 mb-2 print:border-slate-400"></div>
            <p className="text-sm font-semibold text-slate-600">Parent's Signature</p>
          </div>
          
          <div className="text-center">
            <div className="w-48 border-t border-slate-300 mb-2 print:border-slate-400"></div>
            <p className="text-sm font-semibold text-slate-600">Class Teacher / Accountant</p>
          </div>
        </div>

      </div>
      {/* --- MODERN FEE CARD END --- */}

    </div>
  );
}