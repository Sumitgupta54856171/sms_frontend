import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Receipt,
  Banknote,
  CreditCard,
  Landmark,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  fetchPaymentHistory,
  fetchStudentAnnualFees,
  type FeePayment,
} from "@/api/fee";

const SESSIONS = [
  "2024-2025",
  "2025-2026",
  "2026-2027",
  "2027-2028",
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const paymentModeIcons: Record<string, any> = {
  cash: Banknote,
  cheque: Landmark,
  online: CreditCard,
  dd: Landmark,
};

const paymentModeColors: Record<string, string> = {
  cash: "bg-emerald-100 text-emerald-700",
  cheque: "bg-blue-100 text-blue-700",
  online: "bg-purple-100 text-purple-700",
  dd: "bg-amber-100 text-amber-700",
};

interface ViewFeesProps {
  student: any;
  onBack: () => void;
}

export default function ViewFees({ student, onBack }: ViewFeesProps) {
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [showAllSessions, setShowAllSessions] = useState(false);

  // Fetch total annual fees from backend
  const { data: annualFee = 0 } = useQuery({
    queryKey: ["student-annual-fees", student.id],
    queryFn: () => fetchStudentAnnualFees(student.id),
  });

  // Fetch payment history for selected session
  const { data: payments = [], isLoading: historyLoading } = useQuery({
    queryKey: ["payment-history", student.id, selectedSession],
    queryFn: () => fetchPaymentHistory(student.id, selectedSession),
  });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = Math.max(0, annualFee - totalPaid);
  const paidPercent = annualFee > 0 ? Math.round((totalPaid / annualFee) * 100) : 0;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fee Management
        </button>

        {/* Student Info Header */}
        <Card className="mb-6 bg-linear-to-br from-indigo-50 to-white border-indigo-100">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                  {getInitials(student.name)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {student.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                    <span>{student.className}</span>
                    <span className="text-slate-300">|</span>
                    <span>Roll No: {student.rollNo}</span>
                    <span className="text-slate-300">|</span>
                    <span>Scholar No: {student.scholarNo}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium mb-1">Annual Fee</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(annualFee)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium mb-1">Total Paid</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(totalPaid)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium mb-1">Total Due</p>
              <p className={`text-xl font-bold ${totalDue > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {formatCurrency(totalDue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium mb-1">Paid %</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-slate-900">{paidPercent}%</p>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      paidPercent >= 100
                        ? "bg-emerald-500"
                        : paidPercent >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Selector + Payment History */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-lg">Payment History</CardTitle>
              </div>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-36 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No payments recorded</p>
                <p className="text-xs mt-1">
                  No fee payments found for session {selectedSession}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment: FeePayment) => {
                  const ModeIcon = paymentModeIcons[payment.paymentMode] || Banknote;
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                          <ModeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {payment.feeHead}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span>
                              {payment.paymentDate
                                ? format(new Date(payment.paymentDate), "dd MMM yyyy")
                                : "-"}
                            </span>
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 h-4 ${
                                paymentModeColors[payment.paymentMode]
                              }`}
                            >
                              {payment.paymentMode.toUpperCase()}
                            </Badge>
                            <span>•</span>
                            <span className="font-mono">Receipt: {payment.receiptNo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-emerald-600">
                          +{formatCurrency(payment.amount)}
                        </p>
                        {payment.remarks && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {payment.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Sessions Overview */}
        <Card>
          <CardHeader className="pb-3">
            <button
              onClick={() => setShowAllSessions(!showAllSessions)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-lg">Session-wise History</CardTitle>
              </div>
              {showAllSessions ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </CardHeader>
          {showAllSessions && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Session</TableHead>
                    <TableHead>Annual Fee</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SESSIONS.map((session) => {
                    // For demo, show different amounts per session
                    const demoPaid =
                      session === "2026-2027"
                        ? totalPaid
                        : session === "2025-2026"
                        ? Math.round(annualFee * 0.9)
                        : session === "2024-2025"
                        ? annualFee
                        : 0;
                    const demoDue = Math.max(0, annualFee - demoPaid);
                    const demoPayments =
                      session === "2026-2027"
                        ? payments.length
                        : session === "2025-2026"
                        ? 3
                        : session === "2024-2025"
                        ? 4
                        : 0;
                    const isFullyPaid = demoDue === 0;

                    return (
                      <TableRow key={session} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">{session}</TableCell>
                        <TableCell>{formatCurrency(annualFee)}</TableCell>
                        <TableCell className="text-emerald-600 font-medium">
                          {formatCurrency(demoPaid)}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${
                            isFullyPaid ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(demoDue)}
                        </TableCell>
                        <TableCell>
                          {isFullyPaid ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              Paid
                            </Badge>
                          ) : demoPaid > 0 ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              Partial
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              Unpaid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-500">
                          {demoPayments} payment{demoPayments !== 1 ? "s" : ""}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
