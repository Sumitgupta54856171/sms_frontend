import { useState } from "react";
import { Download, Plus, Mail, Phone, PenLine, Calendar, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TeacherForm from "./Teacherform";
import TeacherProfile from "./TeacherProfile";
import TeacherAvatar from "./TeacherAvatar";
import { useQuery } from "@tanstack/react-query";
import { fetchTeachers, changeTeacherRole } from "@/api/teacher";
import type { TeacherResponse } from "@/api/teacher";
import AssignPeriodModal from "./Timetable/AssignPeriodModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openModal, closeModal, setSelectedTeacher } from "@/store/slices/uiSlice";

export default function TeacherManagement() {
  const dispatch = useAppDispatch();
  const isFormOpen = useAppSelector((s) => s.ui.modals.teacherForm);
  const [timetableTeacherId, setTimetableTeacherId] = useState<string | null>(null);
  const [roleModalTeacher, setRoleModalTeacher] = useState<TeacherResponse | null>(null);
  const [roleEmail, setRoleEmail] = useState("");
  const [rolePassword, setRolePassword] = useState("");
  const [roleValue, setRoleValue] = useState<string>("TEACHER");
  const queryClient = useQueryClient();

  const roleMutation = useMutation({
    mutationFn: changeTeacherRole,
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setRoleModalTeacher(null);
      setRoleEmail("");
      setRolePassword("");
      setRoleValue("TEACHER");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const {
    data: teachers,
    isLoading,
    isError,
  } = useQuery<TeacherResponse[]>({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });

  const isProfileOpen = useAppSelector((s) => s.ui.modals.teacherProfile);

  if (isFormOpen) {
    return <TeacherForm onClose={() => dispatch(closeModal("teacherForm"))} />;
  }

  if (isProfileOpen) {
    return <TeacherProfile />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] p-6 md:p-8 font-sans text-slate-900">
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Teachers Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage faculty members, schedules, and assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-[#0d9488]  hover:bg-[#1d4ed8] text-white shadow-sm"
            onClick={() => {
              dispatch(setSelectedTeacher(null));
              dispatch(openModal("teacherForm"));
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* --- LOADING --- */}
      {isLoading && (
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Spinner className="h-8 w-8 text-slate-400" />
        </div>
      )}

      {/* --- ERROR --- */}
      {isError && (
        <div className="max-w-7xl mx-auto text-center py-20 text-slate-500">
          Failed to load teachers. Please try again.
        </div>
      )}

      {/* --- TEACHERS GRID --- */}
      {teachers && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-400">
              No teachers found. Click "Add Teacher" to create one.
            </div>
          )}
          {teachers.map((teacher) => {
            return (
              <Card
                key={teacher.id}
                className="border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden"
              >
                <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
                  {/* Teacher Avatar */}
                  <button
                    onClick={() => {
                      dispatch(setSelectedTeacher(teacher));
                      dispatch(openModal("teacherProfile"));
                    }}
                    className="relative mb-4 cursor-pointer"
                    title="View Profile"
                  >
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-sm transform scale-110 opacity-50"></div>
                    <div className="relative z-10 hover:ring-2 hover:ring-teal-400 rounded-full transition-all">
                      <TeacherAvatar
                        teacherId={teacher.id}
                        teacherName={teacher.fullName}
                        className="h-20 w-20"
                        fallbackClassName="bg-teal-100 text-teal-700 text-lg font-semibold"
                      />
                    </div>
                  </button>

                  {/* Teacher Info */}
                  <button
                    onClick={() => {
                      dispatch(setSelectedTeacher(teacher));
                      dispatch(openModal("teacherProfile"));
                    }}
                    className="cursor-pointer"
                    title="View Profile"
                  >
                    <h3 className="font-bold text-base text-slate-800 mb-0.5 hover:text-indigo-600 transition-colors">
                      {teacher.fullName}
                    </h3>
                  </button>
                  <p className="text-sm text-slate-600 font-medium mb-1.5">
                    {teacher.subject_specialization || "General"}
                  </p>

                  <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5 mb-5">
                    <span>{teacher.employee_id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <Badge
                      variant="outline"
                      className={`border-transparent font-medium text-xs ${
                        teacher.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {teacher.status}
                    </Badge>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    {teacher.gender && (
                      <Badge
                        variant="outline"
                        className="font-medium px-2.5 py-0.5 bg-blue-50 text-blue-600 border-blue-100"
                      >
                        {teacher.gender}
                      </Badge>
                    )}
                    {teacher.sssmid && (
                      <Badge
                        variant="outline"
                        className="font-medium px-2.5 py-0.5 bg-purple-50 text-purple-600 border-purple-100"
                      >
                        SSSMID: {teacher.sssmid}
                      </Badge>
                    )}
                  </div>
                </CardContent>

                {/* Footer Actions */}
                <div className="px-6 pb-6">
                  <div className="border-t border-slate-100 pt-4 flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        dispatch(setSelectedTeacher(teacher));
                        dispatch(openModal("teacherForm"));
                      }}
                      className="h-9 w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRoleModalTeacher(teacher);
                        setRoleEmail(teacher.email);
                        setRolePassword("");
                        setRoleValue("TEACHER");
                      }}
                      className="h-9 w-9 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
                      title="Change Role"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTimetableTeacherId(teacher.id.toString())}
                      className="h-9 w-9 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-full transition-colors"
                      title="Assign Timetable"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Timetable Assignment Modal */}
      {timetableTeacherId && (
        <AssignPeriodModal
          onClose={() => setTimetableTeacherId(null)}
          preselectedTeacherId={timetableTeacherId}
        />
      )}

      {/* Role Change Modal */}
      {roleModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Change Role
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Update access role for <strong>{roleModalTeacher.fullName}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="role-email">Email</Label>
                <Input
                  id="role-email"
                  value={roleEmail}
                  onChange={(e) => setRoleEmail(e.target.value)}
                  placeholder="teacher@email.com"
                />
              </div>
              <div>
                <Label htmlFor="role-password">Password</Label>
                <Input
                  id="role-password"
                  type="password"
                  value={rolePassword}
                  onChange={(e) => setRolePassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="role-select">Role</Label>
                <Select value={roleValue} onValueChange={setRoleValue}>
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="ACCOUNTANT">ACCOUNTANT</SelectItem>
                    <SelectItem value="TEACHER">TEACHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setRoleModalTeacher(null);
                  setRolePassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!roleEmail.trim()) {
                    toast.error("Email is required");
                    return;
                  }
                  if (!rolePassword.trim()) {
                    toast.error("Password is required");
                    return;
                  }
                  roleMutation.mutate({
                    email: roleEmail.trim(),
                    password: rolePassword,
                    role: roleValue as "ADMIN" | "ACCOUNTANT" | "TEACHER",
                  });
                }}
                disabled={roleMutation.isPending}
                className="bg-[#0d9488] hover:bg-teal-700"
              >
                {roleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}