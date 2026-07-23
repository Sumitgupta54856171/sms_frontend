import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, CreditCard, Hash, Landmark, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveBankDetails, fetchBankDetails } from "@/api/student";

interface BankDetailProps {
  studentId?: number;
}

export default function BankDetail({ studentId }: BankDetailProps) {
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    bankName: "",
    accountNo: "",
    ifscCode: "",
    branch: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    fetchBankDetails(studentId)
      .then((data) => {
        console.log(data)
        if (data) {
         
          console.log("check the data",data)
          setBankDetails({
            accountHolder: data.accountHolderName,
            bankName: data.bankName || "",
            accountNo: data.accountNumber || "",
            ifscCode: data.ifscCode || "",
            branch: data.branchName || "",
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
    if (!bankDetails.accountHolder || !bankDetails.bankName || !bankDetails.accountNo || !bankDetails.ifscCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    try {
      await saveBankDetails({ studentId, ...bankDetails });
      toast.success("Bank details saved successfully");
    } catch {
      toast.error("Failed to save bank details");
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    { label: "Account Holder Name", value: bankDetails.accountHolder, onChange: handleChange("accountHolder"), icon: Building2, placeholder: "Enter account holder name" },
    { label: "Bank Name", value: bankDetails.bankName, onChange: handleChange("bankName"), icon: Landmark, placeholder: "Enter bank name" },
    { label: "Account Number", value: bankDetails.accountNo, onChange: handleChange("accountNo"), icon: CreditCard, placeholder: "Enter account number" },
    { label: "IFSC Code", value: bankDetails.ifscCode, onChange: handleChange("ifscCode"), icon: Hash, placeholder: "Enter IFSC code" },
    { label: "Branch", value: bankDetails.branch, onChange: handleChange("branch"), icon: Building2, placeholder: "Enter branch name" },
  ];

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </CardContent>
      </Card>
    );
  }

  return (
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
              <div key={field.label}>
                <Label className="mb-1.5 block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                  {field.label}
                </Label>
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  className="border-slate-200 focus-visible:ring-teal-500"
                />
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Bank Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
