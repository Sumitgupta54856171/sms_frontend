import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Clock,
  Hash,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatTime } from "./utils";

interface TimetableEntry {
  id?: number;
  testtimetableId?: number;
  timetableName: string;
  examType: "test" | "exam";
  classNO: string;
  subject: string;
  date: string;
  day?: string;
  startTime: string;
  endTime: string;
  maxMarks?: number;
  examcode?: number;
}

interface TimetableTableProps {
  groupedByDate: Record<string, TimetableEntry[]>;
  activeTab: "test" | "exam";
  isAuthenticated: boolean;
  isLoading: boolean;
  filteredEntries: TimetableEntry[];
  selectedGrade: string;
  selectedExamName: string;
  isTeacher?: boolean;
  onAddNew: () => void;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: number) => void;
}

export default function TimetableTable({
  groupedByDate,
  activeTab,
  isAuthenticated,
  isLoading,
  filteredEntries,
  selectedGrade,
  selectedExamName,
  isTeacher,
  onAddNew,
  onEdit,
  onDelete,
}: TimetableTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (filteredEntries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">No schedules found</p>
        <p className="text-xs mt-1">
          {activeTab === "test" && selectedExamName === "__placeholder__"
            ? "Select a test name above to view its timetable."
            : selectedGrade !== "__placeholder__" || selectedExamName !== "__placeholder__"
            ? "Try changing the filters."
            : `No ${activeTab} schedules have been created yet.`}
        </p>
        {isAuthenticated && !isTeacher && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNew}
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === "test" ? "Test" : "Exam"} Schedule
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, entries]) => (
        <Card key={date}>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              {formatDate(date)}
              <Badge variant="secondary" className="ml-2 text-xs">
                {entries.length} subject{entries.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">
                      Subject
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">
                      Grade
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">
                      {activeTab === "test" ? "Test" : "Exam"}
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">
                      Code
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">
                      Day
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase">
                      Marks
                    </TableHead>
                    {activeTab === "exam" && (
                      <TableHead className="text-xs font-bold text-slate-500 uppercase">
                        Time
                      </TableHead>
                    )}
                    {isAuthenticated && !isTeacher && (
                      <TableHead className="w-20 text-xs font-bold text-slate-500 uppercase">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry: TimetableEntry, idx: number) => (
                    <TableRow
                      key={entry.id ?? entry.testtimetableId ?? idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="text-sm font-medium text-slate-800">
                            {entry.subject}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                          {entry.classNO}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {entry.timetableName}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.examcode ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-xs">
                            <Hash className="h-3 w-3 mr-0.5" />
                            {entry.examcode}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {entry.day || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {entry.date ? formatDate(entry.date) : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.maxMarks ? (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                            {entry.maxMarks}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>
                      {activeTab === "exam" && (
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 whitespace-nowrap">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {entry.startTime ? formatTime(entry.startTime) : "—"}
                            {entry.endTime ? ` — ${formatTime(entry.endTime)}` : ""}
                          </div>
                        </TableCell>
                      )}
                      {isAuthenticated && !isTeacher && (
                        <TableCell>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onEdit(entry)}
                              className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const deleteId = entry.testtimetableId;
                                if (deleteId) onDelete(deleteId);
                              }}
                              className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
