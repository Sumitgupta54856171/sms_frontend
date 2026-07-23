import { useState, useMemo, memo, useCallback } from "react";
import { Book, GraduationCap, Layers, Sparkles, Plus, X, IndianRupee } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import {
  SUBJECT_GROUPS,
  COURSE_STREAMS,
  getSubjectsForClass,
  type Subject,
} from "@/api/subject";
import { FEE_STRUCTURES } from "@/api/fee";

const ALL_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

const typeColors: Record<string, string> = {
  main: "bg-indigo-100 text-indigo-700 border-indigo-200",
  elective: "bg-amber-100 text-amber-700 border-amber-200",
  additional: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const typeLabels: Record<string, string> = {
  main: "Main",
  elective: "Elective",
  additional: "Additional",
};

const SubjectList = memo(function SubjectList() {
  const [selectedClass, setSelectedClass] = useState("Nursery");
  const [selectedStream, setSelectedStream] = useState<string>("Science");

  // ─── Add Subject Modal State ────────────────────────────────────────
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    type: "main" as "main" | "elective" | "additional",
    className: "Nursery",
  });

  // ─── Add Fee Structure Modal State ──────────────────────────────────
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [newFeeStructure, setNewFeeStructure] = useState({
    className: "Nursery",
    heads: [{ name: "", code: "", amount: 0, isOptional: false }],
  });

  const handleAddSubject = useCallback(() => {
    if (!newSubject.name.trim() || !newSubject.code.trim()) {
      toast.error("Subject name and code are required");
      return;
    }
    // Find the group for the selected class
    const group = SUBJECT_GROUPS.find((g) =>
      g.classes.includes(newSubject.className)
    );
    if (group) {
      group.subjects.push({
        name: newSubject.name.trim(),
        code: newSubject.code.trim().toUpperCase(),
        type: newSubject.type,
      });
      toast.success(`Subject "${newSubject.name}" added to ${newSubject.className}`);
    }
    setShowSubjectForm(false);
    setNewSubject({ name: "", code: "", type: "main", className: "Nursery" });
  }, [newSubject]);

  const handleAddFeeHead = useCallback(() => {
    setNewFeeStructure((prev) => ({
      ...prev,
      heads: [...prev.heads, { name: "", code: "", amount: 0, isOptional: false }],
    }));
  }, []);

  const handleRemoveFeeHead = useCallback((index: number) => {
    setNewFeeStructure((prev) => ({
      ...prev,
      heads: prev.heads.filter((_, i) => i !== index),
    }));
  }, []);

  const handleFeeHeadChange = useCallback(
    (index: number, field: string, value: string | number | boolean) => {
      setNewFeeStructure((prev) => {
        const heads = [...prev.heads];
        heads[index] = { ...heads[index], [field]: value };
        return { ...prev, heads };
      });
    },
    []
  );

  const handleAddFeeStructure = useCallback(() => {
    const { className, heads } = newFeeStructure;
    const validHeads = heads.filter((h) => h.name.trim() && h.code.trim() && h.amount > 0);
    if (validHeads.length === 0) {
      toast.error("Add at least one fee head with name, code, and amount");
      return;
    }
    const annualTotal = validHeads.reduce((sum, h) => sum + h.amount, 0);
    // Find existing structure or create a new one
    const existing = FEE_STRUCTURES.find((f) => f.classes.includes(className));
    if (existing) {
      // Merge heads into existing structure
      validHeads.forEach((h) => {
        const exists = existing.heads.find((eh) => eh.code === h.code);
        if (!exists) {
          existing.heads.push(h);
        }
      });
      existing.annualTotal = existing.heads.reduce((sum, h) => sum + h.amount, 0);
      toast.success(`Fee structure updated for ${className}`);
    } else {
      // Determine class range
      const classNum = parseInt(className.replace("Grade ", ""));
      let classRange = className;
      if (className === "Nursery" || className === "LKG" || className === "UKG") {
        classRange = "Nursery - UKG";
      } else if (classNum >= 1 && classNum <= 5) {
        classRange = "Grade 1 - 5";
      } else if (classNum >= 6 && classNum <= 8) {
        classRange = "Grade 6 - 8";
      } else if (classNum >= 9 && classNum <= 10) {
        classRange = "Grade 9 - 10";
      } else if (classNum >= 11 && classNum <= 12) {
        classRange = "Grade 11 - 12";
      }
      FEE_STRUCTURES.push({
        classRange,
        classes: [className],
        annualTotal,
        heads: validHeads,
      });
      toast.success(`Fee structure created for ${className}`);
    }
    setShowFeeForm(false);
    setNewFeeStructure({
      className: "Nursery",
      heads: [{ name: "", code: "", amount: 0, isOptional: false }],
    });
  }, [newFeeStructure]);

  const isSeniorSecondary = ["Grade 11", "Grade 12"].includes(selectedClass);

  // Subjects for the selected class
  const subjects = useMemo(() => {
    if (isSeniorSecondary) {
      const stream = COURSE_STREAMS.find((s) => s.name === selectedStream);
      const core = getSubjectsForClass(selectedClass);
      return [...core, ...(stream?.subjects ?? [])];
    }
    return getSubjectsForClass(selectedClass);
  }, [selectedClass, selectedStream, isSeniorSecondary]);

  // Group info
  const groupInfo = useMemo(() => {
    return SUBJECT_GROUPS.find((g) => g.classes.includes(selectedClass));
  }, [selectedClass]);

  const mainSubjects = useMemo(
    () => subjects.filter((s) => s.type === "main"),
    [subjects],
  );
  const additionalSubjects = useMemo(
    () => subjects.filter((s) => s.type !== "main"),
    [subjects],
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans contain-content">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Subjects
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View subjects by class and course stream.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Class Select */}
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stream Select (only for 11-12) */}
            {isSeniorSecondary && (
              <Select
                value={selectedStream}
                onValueChange={setSelectedStream}
              >
                <SelectTrigger className="w-36 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_STREAMS.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              className="bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => setShowSubjectForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
            <Button
              className="bg-[#0d9488] hover:bg-teal-700 text-white shadow-sm"
              onClick={() => setShowFeeForm(true)}
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </div>
        </div>

        {/* Info Card */}
        {groupInfo && (
          <Card className="mb-6 bg-linear-to-br from-indigo-50 to-white border-indigo-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">
                    {groupInfo.classRange}
                  </p>
                  <p className="text-xs text-indigo-500">
                    {isSeniorSecondary
                      ? `${selectedStream} stream — ${subjects.length} subjects`
                      : `${subjects.length} subjects`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Subjects */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Main Subjects</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {mainSubjects.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No main subjects defined for this class.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {mainSubjects.map((subject) => (
                  <div
                    key={subject.code}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                      {subject.code}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {subject.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-0.5 text-[10px] px-1.5 py-0 h-4 ${
                          typeColors[subject.type]
                        }`}
                      >
                        {typeLabels[subject.type]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Subjects */}
        {additionalSubjects.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg">
                  Additional Subjects
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {additionalSubjects.map((subject) => (
                  <div
                    key={subject.code}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      {subject.code}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {subject.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-0.5 text-[10px] px-1.5 py-0 h-4 ${
                          typeColors[subject.type]
                        }`}
                      >
                        {typeLabels[subject.type]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stream info for 11-12 */}
        {isSeniorSecondary && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">Course Streams</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COURSE_STREAMS.map((stream) => (
                  <button
                    key={stream.name}
                    onClick={() => setSelectedStream(stream.name)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selectedStream === stream.name
                        ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {stream.name}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {stream.subjects.map((sub) => (
                        <Badge
                          key={sub.code}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {sub.code}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── ADD SUBJECT MODAL ────────────────────────────────────────── */}
      {showSubjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Add Subject</h2>
              <button
                onClick={() => setShowSubjectForm(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sub-class">Class</Label>
                <Select
                  value={newSubject.className}
                  onValueChange={(v) => setNewSubject((s) => ({ ...s, className: v }))}
                >
                  <SelectTrigger id="sub-class" className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sub-name">Subject Name</Label>
                <Input
                  id="sub-name"
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <Label htmlFor="sub-code">Subject Code</Label>
                <Input
                  id="sub-code"
                  value={newSubject.code}
                  onChange={(e) =>
                    setNewSubject((s) => ({ ...s, code: e.target.value }))
                  }
                  placeholder="e.g. MATH"
                />
              </div>
              <div>
                <Label htmlFor="sub-type">Type</Label>
                <Select
                  value={newSubject.type}
                  onValueChange={(v: "main" | "elective" | "additional") =>
                    setNewSubject((s) => ({ ...s, type: v }))
                  }
                >
                  <SelectTrigger id="sub-type" className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="additional">Additional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowSubjectForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSubject}
                className="bg-[#0d9488] hover:bg-teal-700 text-white"
              >
                Add Subject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD FEE STRUCTURE MODAL ──────────────────────────────────── */}
      {showFeeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Add Fee Structure</h2>
              <button
                onClick={() => setShowFeeForm(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fee-class">Class</Label>
                <Select
                  value={newFeeStructure.className}
                  onValueChange={(v) =>
                    setNewFeeStructure((s) => ({ ...s, className: v }))
                  }
                >
                  <SelectTrigger id="fee-class" className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Fee Heads</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddFeeHead}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Head
                  </Button>
                </div>

                {newFeeStructure.heads.map((head, index) => (
                  <div
                    key={index}
                    className="p-3 mb-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Head #{index + 1}
                      </span>
                      {newFeeStructure.heads.length > 1 && (
                        <button
                          onClick={() => handleRemoveFeeHead(index)}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={head.name}
                          onChange={(e) =>
                            handleFeeHeadChange(index, "name", e.target.value)
                          }
                          placeholder="Tuition Fee"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Code</Label>
                        <Input
                          value={head.code}
                          onChange={(e) =>
                            handleFeeHeadChange(index, "code", e.target.value)
                          }
                          placeholder="TUI"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div>
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input
                          type="number"
                          value={head.amount || ""}
                          onChange={(e) =>
                            handleFeeHeadChange(
                              index,
                              "amount",
                              Number(e.target.value)
                            )
                          }
                          placeholder="5000"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 pb-1">
                        <Checkbox
                          id={`optional-${index}`}
                          checked={head.isOptional}
                          onCheckedChange={(checked) =>
                            handleFeeHeadChange(index, "isOptional", checked === true)
                          }
                        />
                        <Label htmlFor={`optional-${index}`} className="text-xs cursor-pointer">
                          Optional
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => setShowFeeForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddFeeStructure}
                className="bg-[#0d9488] hover:bg-teal-700 text-white"
              >
                Save Fee Structure
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default SubjectList;
