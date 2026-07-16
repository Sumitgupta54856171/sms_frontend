import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { GRADES, SUBJECTS, DAYS } from "./constants";

interface TimetableFormModalProps {
  showForm: boolean;
  editingEntry: any;
  formExamType: "test" | "exam";
  formExamName: string;
  formTestCode: string;
  formTotalMarks: string;
  formGrade: string;
  formGrades: string[];
  formSubject: string;
  formDate: string;
  formDay: string;
  formStartTime: string;
  formEndTime: string;
  isSaving: boolean;
  onReset: () => void;
  onExamNameChange: (v: string) => void;
  onTestCodeChange: (v: string) => void;
  onTotalMarksChange: (v: string) => void;
  onGradeChange: (v: string) => void;
  onGradeToggle: (g: string) => void;
  onSubjectChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onDayChange: (v: string) => void;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function TimetableFormModal({
  showForm,
  editingEntry,
  formExamType,
  formExamName,
  formTestCode,
  formTotalMarks,
  formGrade,
  formGrades,
  formSubject,
  formDate,
  formDay,
  formStartTime,
  formEndTime,
  isSaving,
  onReset,
  onExamNameChange,
  onTestCodeChange,
  onTotalMarksChange,
  onGradeChange,
  onGradeToggle,
  onSubjectChange,
  onDateChange,
  onDayChange,
  onStartTimeChange,
  onEndTimeChange,
  onSubmit,
}: TimetableFormModalProps) {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {editingEntry
              ? "Edit Schedule"
              : formExamType === "test"
              ? "Add Test Schedule"
              : "Add Exam Schedule"}
          </h2>
          <button
            onClick={onReset}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* ── Test / Exam Name ── */}
          <div>
            <Label className="mb-1.5 block">
              {formExamType === "test" ? "Test Name" : "Exam Name"}
            </Label>
            <Input
              value={formExamName}
              onChange={(e) => onExamNameChange(e.target.value)}
              placeholder={`e.g. ${formExamType === "test" ? "Weekly Test 1" : "Half Yearly"}`}
            />
          </div>

          {/* ── Test / Exam Code ── */}
          <div>
            <Label className="mb-1.5 block">Test / Exam Code</Label>
            <Input
              value={formTestCode}
              onChange={(e) => onTestCodeChange(e.target.value)}
              placeholder="e.g. T-001 or MID-2026"
            />
          </div>

          {/* ── Subject ── */}
          <div>
            <Label className="mb-1.5 block">Subject</Label>
            <Select value={formSubject} onValueChange={onSubjectChange}>
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

          {/* ── Grade / Class ── */}
          {!editingEntry ? (
            /* Multi-class selection for bulk creation */
            <div>
              <Label className="mb-1.5 block">Select Classes (bulk create)</Label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {GRADES.map((g) => (
                  <label
                    key={g}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                      formGrades.includes(g)
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formGrades.includes(g)}
                      onChange={() => onGradeToggle(g)}
                      className="sr-only"
                    />
                    {g}
                  </label>
                ))}
              </div>
              {formGrades.length > 0 && (
                <p className="text-xs text-indigo-600 mt-1">
                  {formGrades.length} class{formGrades.length > 1 ? "es" : ""} selected
                </p>
              )}
            </div>
          ) : (
            /* Single grade selection for test or editing */
            <div>
              <Label className="mb-1.5 block">Grade / Class</Label>
              <Select
                value={formGrade}
                onValueChange={onGradeChange}
                disabled={!!editingEntry}
              >
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
          )}

          {/* ── Day ── */}
          <div>
            <Label className="mb-1.5 block">Day</Label>
            <Select value={formDay} onValueChange={onDayChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select day..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__" className="hidden">
                  Select day
                </SelectItem>
                {DAYS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Date ── */}
          <div>
            <Label className="mb-1.5 block">Date</Label>
            <Input
              type="date"
              value={formDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          {/* ── Start & End Time (exam only) ── */}
          {formExamType === "exam" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Start Time</Label>
                <Input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">End Time</Label>
                <Input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Total Marks ── */}
          <div>
            <Label className="mb-1.5 block">Total Marks</Label>
            <Input
              type="number"
              min="0"
              value={formTotalMarks}
              onChange={(e) => onTotalMarksChange(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>

          {/* ── Submit ── */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-[#0d9488] hover:bg-teal-700"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingEntry
                ? "Update Schedule"
                : formGrades.length > 1
                ? `Create ${formGrades.length} Entries`
                : "Add Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
