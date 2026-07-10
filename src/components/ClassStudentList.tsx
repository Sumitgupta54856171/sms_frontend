import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, GraduationCap, Hash, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { fetchStudentsByClass } from "@/api/student";

export default function ClassStudentList() {
  const { classNo } = useParams<{ classNo: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["students", "class", classNo],
    queryFn: () => fetchStudentsByClass(classNo!),
    enabled: !!classNo,
  });

  const students = useMemo(() => {
    if (!data?.studentdetail) return [];
    return data.studentdetail.map((s: any, idx: number) => ({
      id: idx + 1,
      class_no:`Class ${s.className}` ??  "-",
      roll_no: s.rolleNo ?? "-",
      name: s.studentName ?? s["Student name"] ?? "-",
      scholar_no: s.scholarNo ?? s.scholarNo ?? "-",
    }));
  }, [data]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 text-slate-600 hover:text-slate-900 -ml-2"
        onClick={() => navigate("/class")}
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Classes
      </Button>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Class {classNo} — Student List
              </CardTitle>
              {data?.classteacherName && (
                <p className="text-sm text-slate-500 mt-1">
                  Class Teacher:{" "}
                  <span className="font-semibold text-slate-700">
                    {data.classteacherName}
                  </span>
                </p>
              )}
            </div>
            <Badge
              variant="secondary"
              className="bg-indigo-50 text-indigo-700 border border-indigo-200 gap-1.5 px-3 py-1.5 text-sm self-start"
            >
              <Users className="h-4 w-4" />
              {students.length} Student{students.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Spinner className="h-5 w-5" />
              <span>Loading students...</span>
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-red-500">
              Failed to load students. Please try again.
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No students found for this class.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 pl-6">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        CLASS NO
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        ROLL NO
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">
                      STUDENT NAME
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 pr-6">
                      SCHOLAR NO
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow
                      key={student.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="py-3 pl-6 font-medium text-slate-800">
                        {student.class_no}
                      </TableCell>
                      <TableCell className="py-3 text-slate-600">
                        {student.roll_no}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-semibold text-slate-900">
                          {student.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 pr-6 text-slate-600">
                        {student.scholar_no}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
