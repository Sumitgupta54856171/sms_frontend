import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  Hash,
  BookOpen,
  IndianRupee,
  ArrowUpDown,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

import { fetchStudentsByClass } from "@/api/student";
import { saveEnrollment, type EnrollmentRequest } from "@/api/enrollment";
import { classes } from "@/components/data/class";
import StudentAvatar from "@/components/StudentAvatar";

export default function EnrollmentList() {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set()); // Use unique row IDs for selection
  const [enrollments, setEnrollments] = useState<Record<number, EnrollmentRequest>>({});
  const [nextClass, setNextClass] = useState<string>("");
  const [bulkFees, setBulkFees] = useState<string>("");

  // Fetch students when a class is selected
  const { data, isLoading, isError } = useQuery({
    queryKey: ["students", "class", selectedClass],
    queryFn: () => fetchStudentsByClass(selectedClass),
    enabled: !!selectedClass,
  });

  // Compute the next class number
  const currentClassIndex = useMemo(() => {
    return classes.findIndex((c) => c.no === selectedClass);
  }, [selectedClass]);

  const suggestedNextClass = useMemo(() => {
    if (currentClassIndex >= 0 && currentClassIndex < classes.length - 1) {
      return classes[currentClassIndex + 1].no;
    }
    return "";
  }, [currentClassIndex]);

  // Parse students from API response
  const students = useMemo(() => {
    if (!data?.studentdetail) return [];
    return data.studentdetail.map((s: any, idx: number) => ({
      id: idx + 1, // Unique row ID for UI state (checkbox, selection)
      studentId: s.studentId ?? s.id, // API student ID for backend
      classNo: s.className ?? selectedClass,
      rollNo: s.rolleNo ?? "-",
      name: s.studentName ?? s["Student name"] ?? "-",
      scholarNo: s.scholarNo ?? "-",
    }));
  }, [data, selectedClass]);

  // Select / Deselect All
  const toggleAll = () => {
    if (selectedRowIds.size === students.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(students.map((s: any) => s.id)));
    }
  };

  // Update a field in enrollment data
  const updateEnrollment = (
    studentId: number,
    field: keyof EnrollmentRequest,
    value: string | number
  ) => {
    setEnrollments((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Promote mutation
  const promoteMutation = useMutation({
    mutationFn: saveEnrollment,
    onSuccess: (res) => {
      toast.success(res?.message || "Student promoted successfully!");
      queryClient.invalidateQueries({ queryKey: ["students", "class", selectedClass] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to promote student");
    },
  });

  // Promote single student
  const handlePromoteSingle = (studentId: number) => {
    const data = enrollments[studentId];
    if (!data) return;
    promoteMutation.mutate([data]);
  };

  // Promote all selected students
  const handlePromoteSelected = () => {
    const entries: EnrollmentRequest[] = Array.from(selectedRowIds)
      .map((rowId) => {
        const student = students.find((s: any) => s.id === rowId);
        return student ? enrollments[student.studentId] : undefined;
      })
      .filter((e): e is EnrollmentRequest => !!e);
    if (entries.length === 0) {
      toast.error("No students selected for promotion");
      return;
    }
    promoteMutation.mutate(entries);
  };

  // Set next class for all selected
  const handleNextClassChange = (value: string) => {
    setNextClass(value);
    setEnrollments((prev) => {
      const updated = { ...prev };
      selectedRowIds.forEach((rowId) => {
        const student = students.find((s: any) => s.id === rowId);
        if (student && updated[student.studentId]) {
          updated[student.studentId] = { ...updated[student.studentId], classNo: value };
        }
      });
      return updated;
    });
  };

  // Set bulk fees for all selected
  const handleBulkFeesChange = (value: string) => {
    setBulkFees(value);
    const numVal = Math.round(Number(value)) || 0;
    setEnrollments((prev) => {
      const updated = { ...prev };
      selectedRowIds.forEach((rowId) => {
        const student = students.find((s: any) => s.id === rowId);
        if (student && updated[student.studentId]) {
          updated[student.studentId] = { ...updated[student.studentId], Totalfees: numVal };
        }
      });
      return updated;
    });
  };

  const isPromoting = promoteMutation.isPending;

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600" />
        <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase text-slate-900">
          Student Enrollment / Promotion
        </h2>
      </div>

      {/* Class Selector Card */}
      <Card className="border-slate-200 shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="w-full sm:w-64">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                Select Current Class
              </label>
              <Select
                value={selectedClass}
                onValueChange={(val) => {
                  setSelectedClass(val);
                  setEnrollments({});
                  setNextClass("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass && suggestedNextClass && (
              <div className="w-full sm:w-64">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  Promote to Class
                </label>
                <Select value={nextClass || suggestedNextClass} onValueChange={handleNextClassChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select next class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.slice(currentClassIndex + 1).map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedClass && (
              <Badge
                variant="secondary"
                className="bg-indigo-50 text-indigo-700 border border-indigo-200 gap-1.5 px-3 py-1.5 text-sm"
              >
                <Users className="h-4 w-4" />
                {students.length} Student{students.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Bulk controls — shown when students are selected */}
          {selectedRowIds.size > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mt-4 pt-4 border-t border-slate-200">
              <div className="w-full sm:w-48">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                  Bulk Fees (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    className="h-9 text-sm pl-8"
                    type="number"
                    placeholder="Enter amount"
                    value={bulkFees}
                    onChange={(e) => handleBulkFeesChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                  Bulk Class
                </label>
                <Select value={nextClass || suggestedNextClass} onValueChange={handleNextClassChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.slice(currentClassIndex + 1).map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handlePromoteSelected}
                disabled={isPromoting}
                className="bg-[#0d9488] hover:bg-teal-700 text-white gap-2 h-9"
              >
                {isPromoting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpDown className="h-4 w-4" />
                )}
                Promote {selectedRowIds.size} Student{selectedRowIds.size !== 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student List */}
      {!selectedClass && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center text-slate-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">Select a class to view students</p>
            <p className="text-sm text-slate-400 mt-1">
              Choose a class above to start the enrollment process
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Spinner className="h-5 w-5" />
            <span>Loading students...</span>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center text-red-500">
            <XCircle className="h-10 w-10 mx-auto mb-2" />
            Failed to load students. Please try again.
          </CardContent>
        </Card>
      )}

      {selectedClass && !isLoading && !isError && students.length === 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center text-slate-500">
            <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            No students found in this class.
          </CardContent>
        </Card>
      )}

      {selectedClass && !isLoading && !isError && students.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Students — Class {classes.find((c) => c.no === selectedClass)?.name || selectedClass}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 px-3 py-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {selectedRowIds.size} Selected
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="py-4 pl-6 w-10">
                      <Checkbox
                        checked={students.length > 0 && selectedRowIds.size === students.length}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 w-12">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 min-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        STUDENT NAME
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 min-w-[100px]">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        CURRENT ROLL
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 min-w-[120px]">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        NEW CLASS
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 min-w-[120px]">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        NEW ROLL NO
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="h-3.5 w-3.5" />
                        TOTAL FEES
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 pr-6 w-[120px]">
                      ACTION
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any, index: number) => {
                    const isChecked = selectedRowIds.has(student.id);
                    const enrollmentData = enrollments[student.studentId];

                    return (
                      <TableRow
                        key={student.studentId || index}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          isChecked ? "bg-indigo-50/40" : ""
                        }`}
                      >
                        <TableCell className="py-3 pl-6">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Select student by row ID
                                setSelectedRowIds((prev) => new Set([...prev, student.id]));
                                // Auto-init enrollment when selecting
                                setEnrollments((prev) => {
                                  if (prev[student.studentId]) return prev;
                                  return {
                                    ...prev,
                                    [student.studentId]: {
                                      classNo: nextClass || suggestedNextClass,
                                      rolNo: student.rollNo,
                                      studentId: student.studentId,
                                      Totalfees: Math.round(Number(bulkFees)) || 0,
                                    },
                                  };
                                });
                              } else {
                                // Deselect student by row ID
                                setSelectedRowIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(student.id);
                                  return next;
                                });
                                // Remove enrollment data
                                setEnrollments((prev) => {
                                  const updated = { ...prev };
                                  delete updated[student.studentId];
                                  return updated;
                                });
                              }
                            }}
                            aria-label={`Select ${student.name}`}
                          />
                        </TableCell>
                        <TableCell className="py-3 text-slate-400 text-sm font-mono">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <StudentAvatar
                              studentId={student.studentId}
                              studentName={student.name}
                              className="h-8 w-8"
                            />
                            <span className="font-semibold text-slate-900">
                              {student.name}
                            </span>
                          </div>
                          {student.scholarNo !== "-" && (
                            <span className="text-xs text-slate-400 ml-2">
                              ({student.scholarNo})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-slate-600 font-mono">
                          {student.rollNo}
                        </TableCell>
                        <TableCell className="py-3">
                          {isChecked ? (
                            <Select
                              value={enrollmentData?.classNo || ""}
                              onValueChange={(val) =>
                                updateEnrollment(student.studentId, "classNo", val)
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.slice(currentClassIndex + 1).map((cls) => (
                                  <SelectItem key={cls.id} value={cls.no}>
                                    {cls.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          {isChecked ? (
                            <Input
                              className="h-8 text-sm w-full"
                              placeholder="Unique roll no"
                              value={enrollmentData?.rolNo || ""}
                              onChange={(e) =>
                                updateEnrollment(
                                  student.studentId,
                                  "rolNo",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          {isChecked ? (
                            <div className="relative">
                              <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <Input
                                className="h-8 text-sm pl-7 w-full"
                                type="number"
                                placeholder="Amount"
                                value={enrollmentData?.Totalfees ?? ""}
                                onChange={(e) =>
                                  updateEnrollment(
                                    student.studentId,
                                    "Totalfees",
                                      Math.round(Number(e.target.value))
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 pr-6">
                          {isChecked ? (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                              onClick={() => handlePromoteSingle(student.studentId)}
                              disabled={isPromoting}
                            >
                              {isPromoting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Promote
                            </Button>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
