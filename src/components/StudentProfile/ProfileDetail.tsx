import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Mail, Phone, User, MapPin, BookOpen, Hash, IdCard } from "lucide-react";

interface StudentData {
  id: number;
  name: string;
  email: string;
  classInfo?: string;
  roll?: string;
  status: string;
  scholar_no?: string;
  sssmid?: string;
  aadhaar?: string;
  gender?: string;
  category?: string;
  dob?: string;
  phone?: string;
  father_name?: string;
  mother_name?: string;
  enrollment?: any[];
  studentRaw?: any;
}

interface ProfileDetailProps {
  student: StudentData;
}

export default function ProfileDetail({ student }: ProfileDetailProps) {
  const initials = student.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const infoItems = [
    { label: "Scholar No.", value: student.scholar_no, icon: BookOpen },
    { label: "Roll Number", value: student.roll, icon: Hash },
    { label: "Class", value: student.classInfo, icon: BookOpen },
    { label: "Gender", value: student.gender, icon: User },
    { label: "Category", value: student.category, icon: User },
    { label: "Date of Birth", value: student.dob ? new Date(student.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-", icon: Calendar },
    { label: "Phone", value: student.phone, icon: Phone },
    { label: "Email", value: student.email, icon: Mail },
    { label: "Father's Name", value: student.father_name, icon: User },
    { label: "Mother's Name", value: student.mother_name, icon: User },
    { label: "SSSMID", value: student.sssmid, icon: IdCard },
    { label: "Aadhaar", value: student.aadhaar, icon: IdCard },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white/80 shadow-lg">
              <AvatarFallback className="bg-white/90 text-teal-700 text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-teal-100 text-sm mt-1">{student.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-white/20 text-white border-transparent hover:bg-white/30">
                  {student.classInfo || "N/A"}
                </Badge>
                <Badge
                  className={`border-transparent ${
                    student.status === "Active"
                      ? "bg-emerald-500/80 text-white"
                      : "bg-slate-400/80 text-white"
                  }`}
                >
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Details Grid */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-teal-600" />
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
  );
}
