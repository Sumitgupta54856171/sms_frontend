import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  IndianRupee,
  Wallet,
  Banknote,
  CreditCard,
  Landmark,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import StudentAvatar from "@/components/StudentAvatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  recordFeePayment,
  getFeeStructureForClass,
  type PayFeePayload,
} from "@/api/fee";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const PAYMENT_MODES = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "cheque", label: "Cheque", icon: Landmark },
  { value: "online", label: "Online Transfer", icon: CreditCard },
  { value: "dd", label: "Demand Draft", icon: Landmark },
];

const FEE_HEADS = [
  "Tuition Fee",
  "Admission Fee",
  "Development Fee",
  "Library Fee",
  "Sports Fee",
  "Computer Lab Fee",
  "Science Lab Fee",
  "Medical Checkup",
  "Miscellaneous",
];

interface PayFeesProps {
  student: any;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PayFees({ student, onBack, onSuccess }: PayFeesProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [feeHead, setFeeHead] = useState("Tuition Fee");
  const [remarks, setRemarks] = useState("");
  const [success, setSuccess] = useState(false);

  const feeStructure = getFeeStructureForClass(student.className);

  const payMutation = useMutation({
    mutationFn: (payload: PayFeePayload) => recordFeePayment(payload),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["fee-summary", student.id] });
      queryClient.invalidateQueries({ queryKey: ["payment-history", student.id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    payMutation.mutate({
      studentId: student.id,
      amount: parseFloat(amount),
      paymentMode: paymentMode as PayFeePayload["paymentMode"],
      feeHead,
      session: "2026-2027",
      remarks: remarks || undefined,
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
        <div className="mx-auto max-w-lg mt-20">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-slate-500 mb-2">
                Fee payment of {formatCurrency(parseFloat(amount))} has been recorded.
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Receipt will be generated shortly.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={onBack}>
                  Back to Students
                </Button>
                <Button onClick={onSuccess} className="bg-emerald-600 hover:bg-emerald-700">
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fee Management
        </button>

        {/* Student Info */}
        <Card className="mb-6 bg-linear-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <StudentAvatar
                studentId={student.id}
                studentName={student.name}
                className="h-12 w-12"
                fallbackClassName="bg-emerald-100 text-emerald-600 text-base font-bold"
              />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {student.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {student.className} · Roll No: {student.rollNo} · Scholar: {student.scholarNo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Info */}
        {feeStructure && (
          <Card className="mb-6">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Annual Fee</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(feeStructure.annualTotal)}
                  </p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                  Session 2026-2027
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Record Payment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fee Head */}
              <div className="space-y-2">
                <Label htmlFor="feeHead">Fee Head</Label>
                <Select value={feeHead} onValueChange={setFeeHead}>
                  <SelectTrigger id="feeHead" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_HEADS.map((head) => (
                      <SelectItem key={head} value={head}>
                        {head}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAYMENT_MODES.map((mode) => {
                    const ModeIcon = mode.icon;
                    const isSelected = paymentMode === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setPaymentMode(mode.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <ModeIcon
                          className={`h-5 w-5 ${
                            isSelected ? "text-emerald-600" : "text-slate-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isSelected ? "text-emerald-700" : "text-slate-600"
                          }`}
                        >
                          {mode.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (optional)</Label>
                <Input
                  id="remarks"
                  placeholder="Any notes or remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="bg-white"
                />
              </div>

              <Separator />

              {/* Submit */}
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!amount || parseFloat(amount) <= 0 || payMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  {payMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-4 w-4" />
                      Pay {amount ? formatCurrency(parseFloat(amount)) : ""}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
