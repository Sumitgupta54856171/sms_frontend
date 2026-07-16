import { useState, useMemo, memo } from "react";
import { Book, GraduationCap, Layers, Sparkles } from "lucide-react";

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

import {
  SUBJECT_GROUPS,
  COURSE_STREAMS,
  getSubjectsForClass,
  type Subject,
} from "@/api/subject";

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
    </div>
  );
});

export default SubjectList;
