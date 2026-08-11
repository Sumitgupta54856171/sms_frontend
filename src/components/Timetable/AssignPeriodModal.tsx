import { useState } from "react";
import { X } from "lucide-react";
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
import type { PeriodEntry } from "@/api/timetable";
import { savePeriod } from "@/api/timetable";
import { toast } from "sonner";

const PERIODS = [1, 2, 3, 4, 5, 6,7,8];
const GRADES = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "Hindi",
  "Sanskrit",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Accountancy",
  "Business Studies",
  "Physical Education",
  "Art & Craft",
  "Music",
  "Moral Science",
  "General Knowledge",
  "Environmental Studies",
  "Drawing"
];

interface AssignPeriodModalProps {
  onClose: () => void;
  preselectedTeacherId?: string;
}

export default function AssignPeriodModal({
  onClose,
  preselectedTeacherId,
}: AssignPeriodModalProps) {
  const queryClient = useQueryClient();

  const [gradeClass, setGradeClass] = useState("__placeholder__");
  const [subjectName, setSubjectName] = useState("__placeholder__");
  const [periodNumber, setPeriodNumber] = useState(1);
  const [teacherId, setTeacherId] = useState(
    preselectedTeacherId || "__placeholder__"
  );
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });


  const mutation = useMutation({
    mutationFn: async (formData: PeriodEntry) => {
      return await savePeriod(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-periods"] });
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      queryClient.invalidateQueries({ queryKey: ["my-timetable"] });
      toast.success("Period assigned successfully");
      onClose();
    },
    onError: () => {
      toast.error("Failed to save period");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeClass || gradeClass === "__placeholder__") {
      toast.error("Please select a grade/class");
      return;
    }
    if (!subjectName || subjectName === "__placeholder__") {
      toast.error("Subject name is required");
      return;
    }
    if (!teacherId || teacherId === "__placeholder__") {
      toast.error("Please select a teacher");
      return;
    }
    const payload: PeriodEntry = {
      gradeClass,
      subjectName,
      periodNumber,
      teacher_id: parseInt(teacherId),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            Assign Period
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Grade/Class */}
          <div>
            <Label className="mb-1.5 block">Grade / Class</Label>
            <Select value={gradeClass} onValueChange={setGradeClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" className="hidden">
                  Select grade
                </SelectItem>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label className="mb-1.5 block">Subject</Label>
            <Select value={subjectName} onValueChange={setSubjectName}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" className="hidden">
                  Select subject
                </SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Number */}
          <div>
            <Label className="mb-1.5 block">Period</Label>
            <Select
              value={periodNumber.toString()}
              onValueChange={(v) => setPeriodNumber(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p} value={p.toString()}>
                    Period {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher */}
          <div>
            <Label className="mb-1.5 block">Teacher</Label>
            <Select
              value={teacherId}
              onValueChange={setTeacherId}
              disabled={!!preselectedTeacherId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" className="hidden">
                  Select teacher
                </SelectItem>
                {teachers.map((t: TeacherResponse) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.fullName}{" "}
                    {t.subject_specialization
                      ? `(${t.subject_specialization})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Saving..."
                : "Assign Period"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
