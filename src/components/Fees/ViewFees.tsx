import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Percent,
  X,
  Check,
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
  fetchInvoiceByEnrollmentId,
  fetchStudentFeeDetails,
  fetchStudentSessions,
  fetchSessionWiseHistory,
  applyDiscount,
  type InvoiceData,
  type SessionWiseHistory,
} from "@/api/fee";

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
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const queryClient = useQueryClient();

  const discountMutation = useMutation({
    mutationFn: () => applyDiscount(student.id, Number(discountAmount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-fee-details", student.id] });
      setShowDiscountInput(false);
      setDiscountAmount("");
    },
  });

  // Fetch fee details from backend (annual fee, paid, due, discount)
  const { data: feeDetails } = useQuery({
    queryKey: ["student-fee-details", student.id],
    queryFn: () => fetchStudentFeeDetails(student.id),
  });

  const annualFee = feeDetails?.totalAnnualFee ?? 0;
  const totalPaid = feeDetails?.totalPaid ?? 0;
  const totalDue = feeDetails?.totaldue ?? 0;
  const discount = feeDetails?.discount ?? 0;
  const netDue = Math.max(0, totalDue - discount);
  const totalAmount = annualFee + totalDue - discount;
  const paidPercent = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Fetch available sessions for this student
  const { data: sessions = [] } = useQuery({
    queryKey: ["student-sessions", student.id],
    queryFn: () => fetchStudentSessions(student.id),
  });

  // Auto-select first session when data loads
  useEffect(() => {
    if (sessions.length > 0 && selectedEnrollmentId === null) {
      setSelectedEnrollmentId(sessions[0].enrollementNo);
    }
  }, [sessions, selectedEnrollmentId]);

  // Fetch payment history (invoices) for selected enrollment
  const { data: payments = [], isLoading: historyLoading } = useQuery({
    queryKey: ["payment-history", selectedEnrollmentId],
    queryFn: () => fetchInvoiceByEnrollmentId(selectedEnrollmentId!),
    enabled: selectedEnrollmentId !== null,
  });

  // Fetch session-wise history for the student
  const { data: sessionHistory = [] } = useQuery({
    queryKey: ["session-wise-history", student.id],
    queryFn: () => fetchSessionWiseHistory(student.id),
  });

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 font-medium">Annual Fee</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                  onClick={() => setShowDiscountInput(!showDiscountInput)}
                >
                  <Percent className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(annualFee)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium mb-1">Total Amount (Annual Fee + Due)</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(totalAmount)}
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
              <p className="text-xs text-slate-500 font-medium mb-1">Discount</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(discount)}
              </p>
              {showDiscountInput && (
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 h-8 px-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    min="0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => discountMutation.mutate()}
                    disabled={!discountAmount || Number(discountAmount) <= 0 || discountMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setShowDiscountInput(false);
                      setDiscountAmount("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-slate-500 font-medium mb-1">Due Amount</p>
              <p className={`text-xl font-bold ${netDue > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {formatCurrency(netDue)}
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
              <Select
                value={selectedEnrollmentId?.toString() ?? ""}
                onValueChange={(v) => setSelectedEnrollmentId(Number(v))}
              >
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.enrollementNo} value={s.enrollementNo.toString()}>
                      {s.sessionName}
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
                  No fee payments found for this session.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment: InvoiceData) => {
                  const modeKey = payment.paymentMethod?.toLowerCase() || "cash";
                  const ModeIcon = paymentModeIcons[modeKey] || Banknote;
                  return (
                    <div
                      key={payment.invoiceId}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                          <ModeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {payment.studentName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span>
                              {payment.invoiceDate
                                ? format(new Date(payment.invoiceDate), "dd MMM yyyy")
                                : "-"}
                            </span>
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 h-4 ${
                                paymentModeColors[modeKey]
                              }`}
                            >
                              {payment.paymentMethod?.toUpperCase() || "CASH"}
                            </Badge>
                            <span>•</span>
                            <span className="font-mono">Invoice #{payment.invoiceId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-emerald-600">
                          +{formatCurrency(payment.amount)}
                        </p>
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
                    <TableHead className="text-right">Payments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                        No session history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessionHistory.map((session: SessionWiseHistory) => {
                      return (
                        <TableRow
                          key={session.sessionName}
                          className="hover:bg-slate-50/50"
                        >
                          <TableCell className="font-medium">{session.sessionName}</TableCell>
                          <TableCell>{formatCurrency(session.totalfees)}</TableCell>
                          <TableCell className="text-emerald-600 font-medium">
                            {formatCurrency(session.totalpaid)}
                          </TableCell>
                          <TableCell
                            className={`font-medium ${
                              session.totaldue === 0 ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(session.totaldue)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-500">
                            {session.paymentsNo} payment{session.paymentsNo !== 1 ? "s" : ""}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
