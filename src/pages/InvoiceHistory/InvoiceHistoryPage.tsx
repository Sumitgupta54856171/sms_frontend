import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  IndianRupee,
  Calendar,
  Receipt,
  FileText,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Printer,
  Download,
} from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchInvoiceHistory, type InvoiceHistoryItem } from "@/api/fee";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: string) => {
  try {
    return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
  } catch {
    return dateStr;
  }
};

const getPaymentMethodColor = (method: string) => {
  switch (method?.toLowerCase()) {
    case "cash":
      return "bg-emerald-100 text-emerald-700";
    case "cheque":
      return "bg-blue-100 text-blue-700";
    case "online":
      return "bg-purple-100 text-purple-700";
    case "dd":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function InvoiceHistoryPage() {
  const navigate = useNavigate();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(
    format(firstDayOfMonth, "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: historyData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["invoice-history", startDate, endDate],
    queryFn: () => fetchInvoiceHistory(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });

  const invoices = historyData?.invoice ?? [];
  const totalAmount = historyData?.totalamount ?? 0;
  const totalSessionPaidAmount = historyData?.totalsessionpaidamount ?? 0;
  const totalInvoicesAmount = historyData?.totalInvoicesAmount ?? 0;

  const filteredInvoices = invoices.filter((inv: InvoiceHistoryItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.studentName?.toLowerCase().includes(q) ||
      inv.paymentMethod?.toLowerCase().includes(q) ||
      String(inv.invoiceId).includes(q)
    );
  });

  const handlePreviousMonth = () => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(endDate);
    end.setMonth(end.getMonth() - 1);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  };

  const handleNextMonth = () => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + 1);
    const end = new Date(endDate);
    end.setMonth(end.getMonth() + 1);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
              Invoice History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View and search invoices within a date range.
            </p>
          </div>

          {/* Mobile: collapsible date controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="gap-1 flex-1 sm:flex-none text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <div className="flex items-center gap-1 bg-white rounded-lg border px-2 py-1.5 flex-1 sm:flex-none">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs sm:text-sm border-0 outline-none bg-transparent w-24 sm:w-32"
                />
                <span className="text-slate-400 text-xs">—</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs sm:text-sm border-0 outline-none bg-transparent w-24 sm:w-32"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="gap-1 flex-1 sm:flex-none text-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 text-xs w-full sm:w-auto"
              disabled={isFetching}
            >
              <Search className="h-3.5 w-3.5" />
              {isFetching ? "Loading..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-blue-100 text-blue-600">
                  <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                    Total Invoices
                  </p>
                  <p className="text-base sm:text-xl font-bold text-slate-900">
                    {invoices.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                  <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                    Filtered Total
                  </p>
                  <p className="text-sm sm:text-xl font-bold text-slate-900 truncate">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-violet-100 text-violet-600">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                    All Time
                  </p>
                  <p className="text-sm sm:text-xl font-bold text-slate-900 truncate">
                    {formatCurrency(totalInvoicesAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-amber-100 text-amber-600">
                  <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                    Session Fees
                  </p>
                  <p className="text-sm sm:text-xl font-bold text-slate-900 truncate">
                    {formatCurrency(totalSessionPaidAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2.5 rounded-xl bg-rose-100 text-rose-600">
                  <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                    Due Amount
                  </p>
                  <p className="text-sm sm:text-xl font-bold text-slate-900 truncate">
                    {formatCurrency(Math.max(0, totalSessionPaidAmount - totalInvoicesAmount))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, payment method, or invoice ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white text-sm"
          />
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">
              Invoices
              <span className="text-xs sm:text-sm font-normal text-slate-400 ml-2">
                ({filteredInvoices.length} invoices)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-slate-400">
                <Receipt className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No invoices found</p>
                <p className="text-xs mt-1">
                  {searchQuery
                    ? "Try a different search term."
                    : "No invoices in the selected date range."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-10 sm:w-12 text-xs sm:text-sm">#</TableHead>
                      <TableHead className="text-xs sm:text-sm">Invoice ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">Student</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Date & Time</TableHead>
                      <TableHead className="text-xs sm:text-sm">Payment</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="w-12 text-xs sm:text-sm"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv: InvoiceHistoryItem, index: number) => (
                      <TableRow
                        key={inv.invoiceId ?? index}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="text-xs sm:text-sm text-slate-400 font-mono">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs sm:text-sm font-mono font-medium text-indigo-600">
                            #{inv.invoiceId}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] sm:text-xs font-semibold">
                                {getInitials(inv.studentName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[80px] sm:max-w-none">
                                {inv.studentName}
                              </p>
                              <p className="text-[10px] text-slate-400 sm:hidden">
                                {formatDate(inv.invoiceDate)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                            {formatDateTime(inv.invoiceDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`font-medium text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5 ${getPaymentMethodColor(inv.paymentMethod)}`}
                          >
                            {inv.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                            {formatCurrency(inv.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => {
                                  const printWindow = window.open("", "_blank");
                                  if (!printWindow) return;
                                  printWindow.document.write(`
                                    <!DOCTYPE html><html><head><title>Invoice #${inv.invoiceId}</title>
                                    <style>
                                      @page { size: 80mm auto; margin: 0; }
                                      * { margin: 0; padding: 0; box-sizing: border-box; }
                                      body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 72mm; margin: 0 auto; padding: 5mm 3mm; color: #000; line-height: 1.4; }
                                      .text-center { text-align: center; }
                                      .flex { display: flex; }
                                      .justify-between { justify-content: space-between; }
                                      .border-dashed { border-style: dashed; }
                                      .border-black { border-color: #000; }
                                      .border-t-2 { border-top-width: 2px; }
                                      .my-2 { margin-top: 4px; margin-bottom: 4px; }
                                      .mb-4 { margin-bottom: 8px; }
                                      .mb-1\\.5 { margin-bottom: 3px; }
                                      .mt-6 { margin-top: 12px; }
                                      .text-xs { font-size: 10px; }
                                      .text-sm { font-size: 11px; }
                                      .text-base { font-size: 13px; }
                                      .font-bold { font-weight: bold; }
                                      .uppercase { text-transform: uppercase; }
                                      .tracking-widest { letter-spacing: 2px; }
                                      .leading-tight { line-height: 1.2; }
                                    </style>
                                    </head><body>
                                    <div class="text-center mb-4">
                                      <h1 class="font-bold text-sm uppercase">Rose Convent High School</h1>
                                      <p class="text-xs">Delaura, Satna (M.P.)</p>
                                      <p class="text-xs">+91 9406780812</p>
                                    </div>
                                    <div class="border-t-2 border-dashed border-black my-2"></div>
                                    <div class="text-center font-bold uppercase text-xs tracking-widest">Fee Receipt</div>
                                    <div class="border-t-2 border-dashed border-black my-2"></div>
                                    <div class="flex justify-between text-xs mb-1.5"><span>Invoice No:</span><span class="font-bold">#${inv.invoiceId}</span></div>
                                    <div class="flex justify-between text-xs mb-1.5"><span>Date:</span><span>${formatDate(inv.invoiceDate)}</span></div>
                                    <div class="flex justify-between text-xs mb-1.5"><span>Student:</span><span>${inv.studentName}</span></div>
                                    <div class="flex justify-between text-xs mb-1.5"><span>Payment:</span><span>${inv.paymentMethod}</span></div>
                                    <div class="border-t-2 border-dashed border-black my-2"></div>
                                    <div class="flex justify-between text-xs font-bold mb-2"><span>Amount</span><span>${formatCurrency(inv.amount)}</span></div>
                                    <div class="border-t-2 border-dashed border-black my-2"></div>
                                    <div class="text-center mt-6"><p class="text-sm font-bold">*** THANK YOU ***</p><p class="mt-2 text-xs">Computer Generated Receipt</p></div>
                                    <script>window.onload=function(){window.print();window.close()}<\\/script>
                                    </body></html>
                                  `);
                                  printWindow.document.close();
                                }}
                                className="gap-2 cursor-pointer"
                              >
                                <Printer className="h-4 w-4" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/invoice/${inv.invoiceId}`)}
                                className="gap-2 cursor-pointer"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
