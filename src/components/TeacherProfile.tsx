import { X, User, Mail, Phone, BookOpen, Hash, IdCard, Calendar, Shield, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal } from "@/store/slices/uiSlice";
import TeacherPhotoUpload from "./TeacherPhotoUpload";
import TeacherAvatar from "./TeacherAvatar";

export default function TeacherProfile() {
  const dispatch = useAppDispatch();
  const teacher = useAppSelector((s) => s.ui.selectedTeacher);

  if (!teacher) return null;

  const infoItems = [
    { label: "Employee ID", value: teacher.employee_id, icon: Hash },
    { label: "Email", value: teacher.email, icon: Mail },
    { label: "Phone", value: teacher.phone, icon: Phone },
    { label: "Subject Specialization", value: teacher.subject_specialization, icon: BookOpen },
    { label: "Gender", value: teacher.gender, icon: User },
    { label: "Education", value: teacher.education, icon: GraduationCap },
    { label: "Aadhaar ID", value: teacher.aadhaar_id, icon: IdCard },
    { label: "SSSMID", value: teacher.sssmid, icon: IdCard },
    { label: "Role", value: teacher.role || "TEACHER", icon: Shield },
    { label: "Created At", value: teacher.created_at ? new Date(teacher.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-", icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Teacher Profile</h2>
              <p className="text-xs text-slate-500">{teacher.fullName} • {teacher.employee_id}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeModal("teacherProfile"))}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {/* Profile Header Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-teal-600 to-teal-500 px-6 py-8">
              <div className="flex items-center gap-5">
                <TeacherAvatar
                  teacherId={teacher.id}
                  teacherName={teacher.fullName}
                  className="h-20 w-20 border-4 border-white/80 shadow-lg"
                  fallbackClassName="bg-white/90 text-teal-700 text-xl font-bold"
                />
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{teacher.fullName}</h2>
                  <p className="text-teal-100 text-sm mt-1">{teacher.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-white/20 text-white border-transparent hover:bg-white/30">
                      {teacher.subject_specialization || "General"}
                    </Badge>
                    <Badge
                      className={`border-transparent ${
                        teacher.status === "active"
                          ? "bg-emerald-500/80 text-white"
                          : "bg-slate-400/80 text-white"
                      }`}
                    >
                      {teacher.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Photo Upload */}
          <TeacherPhotoUpload teacherName={teacher.fullName} teacherId={teacher.id} />

          {/* Personal Details Grid */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                {infoItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 text-slate-400 mt-0.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {item.value || "-"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
