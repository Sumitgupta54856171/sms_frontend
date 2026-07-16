import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { GRADES } from "./constants";

interface TimetableFiltersProps {
  selectedGrade: string;
  selectedExamName: string;
  examNames: string[];
  activeTab: "test" | "exam";
  onGradeChange: (value: string) => void;
  onExamNameChange: (value: string) => void;
  onClear: () => void;
  isTeacher?: boolean;
  teacherClassName?: string;
}

export default function TimetableFilters({
  selectedGrade,
  selectedExamName,
  examNames,
  activeTab,
  onGradeChange,
  onExamNameChange,
  onClear,
  isTeacher,
  teacherClassName,
}: TimetableFiltersProps) {
  const hasFilters =
    selectedGrade !== "__placeholder__" || selectedExamName !== "__placeholder__";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-48">
            <Select
              value={selectedGrade}
              onValueChange={onGradeChange}
              disabled={isTeacher}
            >
              <SelectTrigger>
                <SelectValue placeholder={isTeacher ? teacherClassName || "Loading..." : "All grades"} />
              </SelectTrigger>
              <SelectContent>
                {isTeacher && teacherClassName ? (
                  <SelectItem value={teacherClassName}>
                    {teacherClassName}
                  </SelectItem>
                ) : (
                  <>
                    <SelectItem value="__placeholder__">All Grades</SelectItem>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-56">
            <Select value={selectedExamName} onValueChange={onExamNameChange}>
              <SelectTrigger>
                <SelectValue placeholder="All names" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder__">
                  {activeTab === "test" ? "All Tests" : "All Exams"}
                </SelectItem>
                {(examNames ?? []).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-slate-500"
            >
              Clear filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
