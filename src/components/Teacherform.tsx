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
import { saveTeacher } from "@/api/teacher";

interface TeacherFormProps {
  onClose: () => void;
}

export default function TeacherForm({ onClose }: TeacherFormProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    employee_id: "",
    phone: "",
    subject_specialization: "",
    gender: "",
    aadhaar_id: "",
    sssmid: "",
    status: "active",
    password: "",
  });

  const update = (field: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }));

  const mutation = useMutation({
    mutationFn: saveTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.employee_id.trim()) {
      toast.error("Employee ID is required");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Password is required");
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Add New Teacher</h2>
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
            id="teacher-form"
          >
            {/* Row 1 */}
            <div>
              <Label htmlFor="name" className="mb-1.5 block">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={update("name")}
                placeholder="Enter teacher's name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="teacher@school.com"
              />
            </div>

            {/* Row 2 */}
            <div>
              <Label htmlFor="employeeId" className="mb-1.5 block">
                Employee ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employeeId"
                value={form.employee_id}
                onChange={update("employee_id")}
                placeholder="e.g. EMP-2026"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-1.5 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="10 digit mobile number"
                maxLength={15}
              />
            </div>

            {/* Row 3 */}
            <div>
              <Label htmlFor="subjectSpecialization" className="mb-1.5 block">
                Subject Specialization
              </Label>
              <Input
                id="subjectSpecialization"
                value={form.subject_specialization}
                onChange={update("subject_specialization")}
                placeholder="e.g. Mathematics, Science"
              />
            </div>
            <div>
              <Label htmlFor="gender" className="mb-1.5 block">Gender</Label>
              <Select value={form.gender} onValueChange={update("gender")}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 4 */}
            <div>
              <Label htmlFor="aadhaarId" className="mb-1.5 block">
                Aadhaar ID
              </Label>
              <Input
                id="aadhaarId"
                value={form.aadhaar_id}
                onChange={update("aadhaar_id")}
                placeholder="12 Digit Aadhaar"
                maxLength={12}
              />
            </div>
            <div>
              <Label htmlFor="sssmid" className="mb-1.5 block">SSSMID</Label>
              <Input
                id="sssmid"
                value={form.sssmid}
                onChange={update("sssmid")}
                placeholder="9 Digit SSSMID"
                maxLength={9}
              />
            </div>

            {/* Row 5 - Password */}
            <div>
              <Label htmlFor="password" className="mb-1.5 block">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="Set teacher password"
              />
            </div>

            {/* Row 5b - Status */}
            <div>
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
            form="teacher-form"
            disabled={mutation.isPending}
            className="w-full sm:w-auto bg-[#0d9488] hover:bg-teal-700 text-white"
          >
            {mutation.isPending ? "Saving..." : "Save Teacher"}
          </Button>
        </div>
      </div>
    </div>
  );
}