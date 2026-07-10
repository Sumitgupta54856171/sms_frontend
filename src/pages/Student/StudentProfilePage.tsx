import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, User, Calendar, Mail, Phone, MapPin, BookOpen, Hash, IdCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

import { fetchStudentDetail, updateStudentDetail, type StudentDetail } from "@/api/student";

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentDetail>>({});

  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => fetchStudentDetail(Number(studentId)),
    enabled: !!studentId,
  });

  const student = detailResponse?.student ?? null;

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<StudentDetail> & { id: number }) => updateStudentDetail(data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["student-detail", studentId] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (!studentId) return;
    updateMutation.mutate({ ...formData, id: Number(studentId) } as any);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">Student not found</p>
          <Button onClick={() => navigate("/students")} className="mt-4">
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  const initials = student.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const fields = [
    { label: "Name", field: "name", icon: User },
    { label: "Email", field: "email", icon: Mail },
    { label: "Phone", field: "phone", icon: Phone },
    { label: "Scholar No", field: "scholar_no", icon: BookOpen },
    { label: "SSSMID", field: "sssmid", icon: IdCard },
    { label: "Aadhaar", field: "aadhaar", icon: IdCard },
    { label: "Gender", field: "gender", icon: User },
    { label: "Category", field: "category", icon: User },
    { label: "Date of Birth", field: "dob", icon: Calendar },
    { label: "Father's Name", field: "father_name", icon: User },
    { label: "Mother's Name", field: "mother_name", icon: User },
    { label: "APAAR ID", field: "apaarId", icon: IdCard },
    { label: "PEN ID", field: "penId", icon: IdCard },
    { label: "Address", field: "address", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/students")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>

        {/* Profile Header */}
        <Card className="mb-6 bg-linear-to-r from-teal-600 to-teal-500 border-none">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-4 border-white/80 shadow-lg">
                <AvatarFallback className="bg-white/90 text-teal-700 text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-white flex-1">
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-teal-100 text-sm mt-1">{student.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-white/20 text-white border-transparent">
                    Scholar: {student.scholar_no || "N/A"}
                  </Badge>
                  <Badge className={`border-transparent ${student.status === "active" || student.status === "Active" ? "bg-emerald-500/80 text-white" : "bg-slate-400/80 text-white"}`}>
                    {student.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={() => navigate(`/student/bank-detail/${studentId}`)}
                >
                  Bank Details
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={() => navigate(`/student/photo/${studentId}`)}
                >
                  Photo
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={() => navigate(`/student/id-card/${studentId}`)}
                >
                  ID Card
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={() => navigate(`/student/tc/${studentId}`)}
                >
                  TC
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Personal Information
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(student); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              {fields.map(({ label, field, icon: Icon }) => (
                <div key={field} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {label}
                    </p>
                    {isEditing ? (
                      <Input
                        value={(formData as any)[field] ?? ""}
                        onChange={handleChange(field)}
                        className="mt-1 h-8 text-sm border-slate-200"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {(student as any)[field] || "-"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(student); }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
