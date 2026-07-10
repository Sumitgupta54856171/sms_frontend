import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Building2, CreditCard, Hash, Landmark } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { fetchBankDetails, updateBankDetail, saveBankDetails } from "@/api/student";

export default function BankDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    AccountHolderName: "",
    branchName: "",
  });

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    fetchBankDetails(Number(studentId))
      .then((data) => {
        if (data) {
          setBankDetails({
            bankName: data.bankName || "",
            accountNumber: data.accountNo || "",
            ifscCode: data.ifscCode || "",
            AccountHolderName: data.accountHolder || "",
            branchName: data.branch || "",
          });
        }
      })
      .catch(() => { /* no bank details yet */ })
      .finally(() => setIsLoading(false));
  }, [studentId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankDetails((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!studentId) {
      toast.error("Student ID is missing");
      return;
    }
    if (!bankDetails.AccountHolderName || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    try {
      await updateBankDetail({
        studentId: Number(studentId),
        ...bankDetails,
      });
      toast.success("Bank details updated successfully");
    } catch {
      // If update fails, try save
      try {
        await saveBankDetails({
          studentId: Number(studentId),
          accountHolder: bankDetails.AccountHolderName,
          bankName: bankDetails.bankName,
          accountNo: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          branch: bankDetails.branchName,
        });
        toast.success("Bank details saved successfully");
      } catch {
        toast.error("Failed to save bank details");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const fields = [
    { label: "Account Holder Name", field: "AccountHolderName", value: bankDetails.AccountHolderName, icon: Building2, placeholder: "Enter account holder name" },
    { label: "Bank Name", field: "bankName", value: bankDetails.bankName, icon: Landmark, placeholder: "Enter bank name" },
    { label: "Account Number", field: "accountNumber", value: bankDetails.accountNumber, icon: CreditCard, placeholder: "Enter account number" },
    { label: "IFSC Code", field: "ifscCode", value: bankDetails.ifscCode, icon: Hash, placeholder: "Enter IFSC code" },
    { label: "Branch Name", field: "branchName", value: bankDetails.branchName, icon: Building2, placeholder: "Enter branch name" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/student/profile/${studentId}`)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {fields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.field}>
                    <Label className="mb-1.5 text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      {field.label}
                    </Label>
                    <Input
                      value={field.value}
                      onChange={handleChange(field.field)}
                      placeholder={field.placeholder}
                      className="border-slate-200 focus-visible:ring-teal-500"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/student/profile/${studentId}`)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Update Bank Details"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
