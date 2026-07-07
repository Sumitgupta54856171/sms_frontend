import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveStudent } from "@/api/student";
import { IndianRupee } from "lucide-react";

interface StudentFormProps {
  onClose: () => void;
}

export default function StudentForm({ onClose }: StudentFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    email: "",
    class_no: "",
    roll_no: "",
    scholar_no: "",
    sssmid: "",
    aadhaar: "",
    gender: "",
    category: "",
    dob: "",
    phone: "",
    father_name: "",
    mother_name: "",
    status: "active",
    total_fees: "",
  });

  const update =
    (field: string) => (e: any) =>
      setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }));

  const mutation = useMutation({
    mutationFn: saveStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!form.class_no) {
      toast.error("Class is required");
      return;
    }
    if (!form.roll_no.trim()) {
      toast.error("Roll number is required");
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Add New Student</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
            onSubmit={handleSubmit}
            id="student-form"
          >
            <div>
              <Label htmlFor="fullName" className="mb-1.5 block">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={form.name}
                onChange={update("name")}
                placeholder="Enter student's full name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="student@example.com"
              />
            </div>

            <div>
              <Label htmlFor="class" className="mb-1.5 block">
                Grade <span className="text-red-500">*</span>
              </Label>
              <Select value={form.class_no || "__placeholder__"} onValueChange={update("class_no")}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">Select Grade</SelectItem>
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
              <Label htmlFor="rollNo" className="mb-1.5 block">
                Roll No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rollNo"
                value={form.roll_no}
                onChange={update("roll_no")}
                placeholder="e.g. 101"
              />
            </div>
            <div>
              <Label htmlFor="scholarNo" className="mb-1.5 block">
                Scholar Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="scholarNo"
                value={form.scholar_no}
                onChange={update("scholar_no")}
                placeholder="Enter Scholar No."
              />
            </div>

            <div>
              <Label htmlFor="sssmid" className="mb-1.5 block">
                SSSMID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sssmid"
                value={form.sssmid}
                onChange={update("sssmid")}
                placeholder="9 Digit SSSMID"
                maxLength={9}
              />
            </div>
            <div>
              <Label htmlFor="aadhaar" className="mb-1.5 block">
                Aadhaar Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="aadhaar"
                value={form.aadhaar}
                onChange={update("aadhaar")}
                placeholder="12 Digit Aadhaar"
                maxLength={12}
              />
            </div>

            <div>
              <Label htmlFor="gender" className="mb-1.5 block">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select value={form.gender || "__placeholder__"} onValueChange={update("gender")}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">Select Gender</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category" className="mb-1.5 block">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={form.category || "__placeholder__"} onValueChange={update("category")}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" className="hidden">Select Category</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="st">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dob" className="mb-1.5 block">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={form.dob}
                onChange={update("dob")}
                className="block w-full"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-1.5 block">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="Enter 10 digit number"
              />
            </div>

            <div>
              <Label htmlFor="fatherName" className="mb-1.5 block">
                Father Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fatherName"
                value={form.father_name}
                onChange={update("father_name")}
                placeholder="Enter father's name"
              />
            </div>
            <div>
              <Label htmlFor="motherName" className="mb-1.5 block">
                Mother Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="motherName"
                value={form.mother_name}
                onChange={update("mother_name")}
                placeholder="Enter mother's name"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="status" className="mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={update("status")}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total Annual Fees */}
            <div className="md:col-span-2">
              <Label htmlFor="totalFees" className="mb-1.5 block">
                Total Annual Fees (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="totalFees"
                  type="number"
                  min="0"
                  value={form.total_fees}
                  onChange={update("total_fees")}
                  placeholder="Enter total annual fees"
                  className="pl-9"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="student-form"
            disabled={mutation.isPending}
            className="w-full sm:w-auto bg-[#0d9488] hover:bg-teal-700 text-white"
          >
            {mutation.isPending ? "Saving..." : "Add Student"}
          </Button>
        </div>

      </div>
    </div>
  );
}