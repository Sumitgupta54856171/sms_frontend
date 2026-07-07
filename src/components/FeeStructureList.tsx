import { useState, useMemo } from "react";
import { IndianRupee, GraduationCap, BookOpen, Calculator, ChevronDown, ChevronUp } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

import {
  FEE_STRUCTURES,
  getFeeStructureForClass,
} from "@/api/fee";

const ALL_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function FeeStructureList() {
  const [selectedClass, setSelectedClass] = useState("Nursery");
  const [showBreakup, setShowBreakup] = useState(true);

  const feeStructure = useMemo(
    () => getFeeStructureForClass(selectedClass),
    [selectedClass]
  );

  const groupInfo = useMemo(
    () => FEE_STRUCTURES.find((f) => f.classes.includes(selectedClass)),
    [selectedClass]
  );

  const totalHeads = feeStructure?.heads.length ?? 0;
  const calculatedTotal = feeStructure?.heads.reduce((sum, h) => sum + h.amount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Fee Structure
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View annual fee details by class.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Card */}
        {groupInfo && (
          <Card className="mb-6 bg-linear-to-br from-emerald-50 to-white border-emerald-100">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      {groupInfo.classRange}
                    </p>
                    <p className="text-xs text-emerald-500">
                      {totalHeads} fee heads
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-500 font-medium">Annual Total</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(feeStructure?.annualTotal ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fee Heads Table */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg">Fee Breakup</CardTitle>
              </div>
              <button
                onClick={() => setShowBreakup(!showBreakup)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {showBreakup ? (
                  <>
                    Hide <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          {showBreakup && (
            <CardContent>
              {!feeStructure || feeStructure.heads.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  No fee structure defined for {selectedClass}.
                </p>
              ) : (
                <div className="space-y-0">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 rounded-t-lg border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Fee Head</div>
                    <div className="col-span-3 text-right">Amount (₹)</div>
                    <div className="col-span-3 text-right">Type</div>
                  </div>

                  {/* Table Rows */}
                  {feeStructure.heads.map((head, index) => (
                    <div
                      key={head.code}
                      className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors items-center"
                    >
                      {/* Number (desktop only) */}
                      <div className="hidden md:block col-span-1 text-sm text-slate-400 font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      {/* Name + Code */}
                      <div className="col-span-2 md:col-span-5">
                        <p className="text-sm font-medium text-slate-900">
                          {head.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-0.5 text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500 border-slate-200"
                        >
                          {head.code}
                        </Badge>
                      </div>

                      {/* Amount */}
                      <div className="col-span-1 md:col-span-3 text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(head.amount)}
                        </p>
                      </div>

                      {/* Type */}
                      <div className="col-span-1 md:col-span-3 text-right">
                        {head.isOptional ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-50 text-amber-600 border-amber-200"
                          >
                            Optional
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200"
                          >
                            Mandatory
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Total Row */}
                  <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 bg-emerald-50 rounded-b-lg">
                    <div className="hidden md:block col-span-1" />
                    <div className="col-span-2 md:col-span-5">
                      <p className="text-sm font-bold text-emerald-800">Total</p>
                    </div>
                    <div className="col-span-1 md:col-span-3 text-right">
                      <p className="text-sm font-bold text-emerald-700">
                        {formatCurrency(calculatedTotal)}
                      </p>
                    </div>
                    <div className="col-span-1 md:col-span-3 text-right">
                      <Badge className="text-[10px] bg-emerald-600 text-white">
                        {totalHeads} heads
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Installment Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Installment Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  name: "First Installment",
                  percent: 40,
                  due: "April",
                  color: "bg-indigo-50 border-indigo-200 text-indigo-700",
                  badge: "bg-indigo-100 text-indigo-700",
                },
                {
                  name: "Second Installment",
                  percent: 30,
                  due: "August",
                  color: "bg-emerald-50 border-emerald-200 text-emerald-700",
                  badge: "bg-emerald-100 text-emerald-700",
                },
                {
                  name: "Third Installment",
                  percent: 30,
                  due: "November",
                  color: "bg-amber-50 border-amber-200 text-amber-700",
                  badge: "bg-amber-100 text-amber-700",
                },
              ].map((inst) => (
                <div
                  key={inst.name}
                  className={`p-4 rounded-lg border ${inst.color}`}
                >
                  <p className="text-sm font-semibold mb-2">{inst.name}</p>
                  <p className="text-2xl font-bold mb-1">
                    {formatCurrency(
                      Math.round((feeStructure?.annualTotal ?? 0) * inst.percent / 100)
                    )}
                  </p>
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <span>{inst.percent}% of annual</span>
                    <span>Due: {inst.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
