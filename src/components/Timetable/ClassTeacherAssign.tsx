import { useState } from "react";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TeacherResponse } from "@/api/teacher";
import { fetchTeachers } from "@/api/teacher";
import { assignClassTeacher, fetchAllClassTeachers } from "@/api/timetable";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CLASSES = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const SECTIONS = ["A", "B", "C"];

export default function ClassTeacherAssign() {
  const queryClient = useQueryClient();
  const [classNo, setClassNo] = useState("__placeholder__");
  const [section, setSection] = useState("__placeholder__");
  const [teacherId, setTeacherId] = useState("__placeholder__");

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });

  const { data: classTeachers = [] } = useQuery({
    queryKey: ["class-teachers"],
    queryFn: fetchAllClassTeachers,
  });

  const mutation = useMutation({
    mutationFn: assignClassTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-teachers"] });
      toast.success("Class teacher assigned successfully");
      setClassNo("__placeholder__");
      setSection("__placeholder__");
      setTeacherId("__placeholder__");
    },
    onError: () => {
      toast.error("Failed to assign class teacher");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNo || classNo === "__placeholder__" || !teacherId || teacherId === "__placeholder__") {
      toast.error("Please select grade and teacher");
      return;
    }
    mutation.mutate({
      class_no: classNo,
      section: section === "__placeholder__" || section === "none" ? undefined : section,
      teacher_id: parseInt(teacherId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Assign Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-teal-600" />
            Assign Grade Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1.5 block">Grade</Label>
                <Select value={classNo} onValueChange={setClassNo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__" className="hidden">
                      Select grade
                    </SelectItem>
                    {CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        Grade {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Section (optional)</Label>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__" className="hidden">
                      Select section
                    </SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Teacher</Label>
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder__" className="hidden">
                      Select teacher
                    </SelectItem>
                    {teachers.map((t: TeacherResponse) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Assigning..." : "Assign Grade Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Class Teachers List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Current Grade Teachers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {classTeachers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No grade teachers assigned yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classTeachers.map((ct: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div>
                    <span className="font-semibold text-slate-900">
                      Grade {ct.class_no}
                    </span>
                    {ct.section && (
                      <span className="text-slate-500"> - {ct.section}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                    {ct.teacher_name || `Teacher #${ct.teacher_id}`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
