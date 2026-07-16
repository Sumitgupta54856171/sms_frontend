import { UserCheck, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllClassTeachers } from "@/api/timetable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import TeacherAvatar from "@/components/TeacherAvatar";

export default function ClassTeacherAssign() {
  const {
    data: classTeachers = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["class-teachers"],
    queryFn: fetchAllClassTeachers,
  });

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="border-slate-200 shadow-sm bg-blue-50/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full shrink-0 mt-0.5">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Class teachers are automatically assigned by the system when periods are assigned in the timetable.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                No manual assignment needed. This page shows the current class teacher for each grade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Class Teachers List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-teal-600" />
            Current Grade Teachers
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-slate-600"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-6 w-6 text-slate-400" />
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-slate-500">
              Failed to load class teachers.{" "}
              <button
                onClick={() => refetch()}
                className="text-teal-600 hover:underline font-medium"
              >
                Try again
              </button>
            </div>
          ) : classTeachers.length === 0 ? (
            <div className="text-center py-10">
              <UserCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                No grade teachers assigned yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Class teachers will appear here once periods are assigned in the timetable.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classTeachers.map((ct: any, idx: number) => (
                <div
                  key={ct.id ?? idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TeacherAvatar
                      teacherId={ct.teacher_id}
                      teacherName={ct.teacher_name || `Teacher #${ct.teacher_id}`}
                      className="h-9 w-9"
                      fallbackClassName="bg-teal-100 text-teal-700 text-xs font-semibold"
                    />
                    <div>
                      <span className="font-semibold text-slate-900">
                        {ct.gradeClass}
                      </span>
                      {ct.section && (
                        <span className="text-slate-500"> - {ct.section}</span>
                      )}
                    </div>
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
