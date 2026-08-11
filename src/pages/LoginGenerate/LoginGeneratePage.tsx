import { useState, useMemo, useCallback } from "react";
import {
  Search,
  UserPlus,
  Users,
  Key,
  CheckCircle,
  XCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

import { fetchStudentList, type StudentListItem } from "@/api/student";
import { registerRoleBulk, type RegisterRolePayload } from "@/api/auth";

// ─── Types ─────────────────────────────────────────────────────────────
interface LoginForm {
  studentPassword: string;
  parentPassword: string;
}

interface SuccessEntry {
  type: "student" | "parent";
  studentName: string;
  username: string;
}

export default function LoginGeneratePage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [passwords, setPasswords] = useState<LoginForm>({
    studentPassword: "",
    parentPassword: "",
  });
  const [submitting, setSubmitting] = useState<"student" | "parent" | null>(null);
  const [successLog, setSuccessLog] = useState<SuccessEntry[]>([]);
  const [tabValue, setTabValue] = useState("student");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["student-list"],
    queryFn: fetchStudentList,
  });

  // ─── Filter students ──────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const term = globalFilter.toLowerCase();
    return students.filter(
      (s: StudentListItem) =>
        s.studentName?.toLowerCase().includes(term) ||
        s.scholarNo?.toLowerCase().includes(term) ||
        s.faterhName?.toLowerCase().includes(term)
    );
  }, [students, globalFilter]);

  // ─── Multi-select helpers ─────────────────────────────────────────────
  const toggleStudent = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.studentId)));
    }
  }, [filteredStudents, selectedIds.size]);

  const selectedStudents = useMemo(
    () => students.filter((s: StudentListItem) => selectedIds.has(s.studentId)),
    [students, selectedIds]
  );

  // ─── Generate Student Login (bulk) ────────────────────────────────────
  const handleGenerateStudentLogin = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    if (!passwords.studentPassword.trim()) {
      toast.error("Please enter a password for student logins");
      return;
    }

    setSubmitting("student");
    try {
      const payloadList: RegisterRolePayload[] = selectedStudents.map(
        (student: StudentListItem) => ({
          username: student.scholarNo,
          email: String(student.studentId),
          password: passwords.studentPassword,
          role: "STUDENT" as const,
        })
      );

      await registerRoleBulk(payloadList);

      const newEntries: SuccessEntry[] = selectedStudents.map(
        (student: StudentListItem) => ({
          type: "student" as const,
          studentName: student.studentName,
          username: student.scholarNo,
        })
      );

      toast.success(
        `Student login generated for ${newEntries.length} student(s)`
      );
      setSuccessLog((prev) => [...prev, ...newEntries]);
      setPasswords((prev) => ({ ...prev, studentPassword: "" }));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate student logins"
      );
    } finally {
      setSubmitting(null);
    }
  };

  // ─── Generate Parent Login (bulk) ────────────────────────────────────
  const handleGenerateParentLogin = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    if (!passwords.parentPassword.trim()) {
      toast.error("Please enter a password for parent logins");
      return;
    }

    setSubmitting("parent");
    try {
      const payloadList: RegisterRolePayload[] = selectedStudents.map(
        (student: StudentListItem) => {
          const username =
            student.faterhName ||
            student.motherName ||
            `parent_${student.scholarNo}`;
          return {
            username,
            email: String(student.studentId),
            password: passwords.parentPassword,
            role: "PARENT" as const,
          };
        }
      );

      await registerRoleBulk(payloadList);

      const newEntries: SuccessEntry[] = selectedStudents.map(
        (student: StudentListItem) => ({
          type: "parent" as const,
          studentName: student.studentName,
          username:
            student.faterhName ||
            student.motherName ||
            `parent_${student.scholarNo}`,
        })
      );

      toast.success(
        `Parent login generated for ${newEntries.length} student(s)`
      );
      setSuccessLog((prev) => [...prev, ...newEntries]);
      setPasswords((prev) => ({ ...prev, parentPassword: "" }));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate parent logins"
      );
    } finally {
      setSubmitting(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Key className="h-6 w-6 text-indigo-600" />
            Generate Login Credentials
          </h1>
          <p className="text-slate-500 mt-1">
            Select multiple students and generate login credentials in bulk for
            student and parent portals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Student List ───────────────────────────────────── */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-600" />
                    Select Students
                  </CardTitle>
                  <CardDescription>
                    Search and select students to generate login credentials.
                  </CardDescription>
                </div>
                {selectedIds.size > 0 && (
                  <Badge className="bg-indigo-100 text-indigo-700 border-none text-sm px-3 py-1">
                    {selectedIds.size} selected
                  </Badge>
                )}
              </div>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  placeholder="Search by name, scholar no, or father name..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 bg-white border-slate-200 h-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-125 overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow className="border-b border-slate-200">
                      <TableHead className="w-10">
                        <button
                          onClick={toggleAll}
                          className="flex items-center justify-center w-6 h-6"
                          title="Select all"
                        >
                          {selectedIds.size === filteredStudents.length &&
                          filteredStudents.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Student
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Scholar No
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Father
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                          <div className="flex items-center justify-center gap-2">
                            <Spinner className="h-5 w-5" />
                            <span>Loading students...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student: StudentListItem) => {
                        const isChecked = selectedIds.has(student.studentId);
                        const isActive =
                          student.status === "Active" ||
                          student.status === "active";
                        return (
                          <TableRow
                            key={student.studentId}
                            className={`border-b border-slate-100 transition-colors cursor-pointer ${
                              isChecked
                                ? "bg-indigo-50 hover:bg-indigo-50"
                                : "hover:bg-slate-50"
                            }`}
                            onClick={() => toggleStudent(student.studentId)}
                          >
                            <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => toggleStudent(student.studentId)}
                                className="flex items-center justify-center w-6 h-6"
                              >
                                {isChecked ? (
                                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="py-3">
                              <span className="font-semibold text-slate-900 text-sm">
                                {student.studentName}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 text-sm text-slate-600">
                              {student.scholarNo || "-"}
                            </TableCell>
                            <TableCell className="py-3 text-sm text-slate-600">
                              {student.faterhName || "-"}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge
                                variant="outline"
                                className={`border-transparent font-medium ${
                                  isActive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {student.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                          No students found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* ── RIGHT: Login Generation Form ─────────────────────────── */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                Generate Login
              </CardTitle>
              <CardDescription>
                {selectedIds.size > 0
                  ? `${selectedIds.size} student(s) selected`
                  : "Select students from the list"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedIds.size === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Users className="h-12 w-12 mb-3" />
                  <p className="text-sm">Select students to begin</p>
                </div>
              ) : (
                <>
                  {/* Selected students summary */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto space-y-1 text-sm">
                    {selectedStudents.map((s: StudentListItem) => (
                      <div key={s.studentId} className="flex justify-between">
                        <span className="text-slate-600 truncate">
                          {s.studentName}
                        </span>
                        <span className="font-medium text-slate-900 ml-2 shrink-0">
                          {s.scholarNo || "-"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="mb-4" />

                  <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="student">Student Login</TabsTrigger>
                      <TabsTrigger value="parent">Parent Login</TabsTrigger>
                    </TabsList>

                    {/* ── Student Login Tab ──────────────────────────── */}
                    <TabsContent value="student" className="space-y-4 mt-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">
                            Username <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value="Scholar Number (auto-filled)"
                            readOnly
                            className="bg-slate-100 text-slate-500 mt-1 text-sm"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            Each student's scholar number will be used as
                            username
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700">
                            Common Password{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="password"
                            placeholder="Enter password for all selected students"
                            value={passwords.studentPassword}
                            onChange={(e) =>
                              setPasswords((prev) => ({
                                ...prev,
                                studentPassword: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>

                        <div className="pt-2">
                          <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleGenerateStudentLogin}
                            disabled={submitting === "student"}
                          >
                            {submitting === "student" ? (
                              <>
                                <Spinner className="h-4 w-4 mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Key className="h-4 w-4 mr-2" />
                                Generate Student Login ({selectedIds.size})
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* ── Parent Login Tab ───────────────────────────── */}
                    <TabsContent value="parent" className="space-y-4 mt-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">
                            Username <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value="Parent's Name (auto-filled)"
                            readOnly
                            className="bg-slate-100 text-slate-500 mt-1 text-sm"
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            Each parent's name will be used as username
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700">
                            Common Password{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="password"
                            placeholder="Enter password for all selected parents"
                            value={passwords.parentPassword}
                            onChange={(e) =>
                              setPasswords((prev) => ({
                                ...prev,
                                parentPassword: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>

                        <div className="pt-2">
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleGenerateParentLogin}
                            disabled={submitting === "parent"}
                          >
                            {submitting === "parent" ? (
                              <>
                                <Spinner className="h-4 w-4 mr-2" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Generate Parent Login ({selectedIds.size})
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Success Log ────────────────────────────────────────────── */}
        {successLog.length > 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Generated Logins
              </CardTitle>
              <CardDescription>
                Recently generated login credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-auto">
                {successLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-sm"
                  >
                    {entry.type === "student" ? (
                      <Badge className="bg-indigo-100 text-indigo-700 border-none shrink-0">
                        Student
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none shrink-0">
                        Parent
                      </Badge>
                    )}
                    <span className="text-slate-600 truncate min-w-0">
                      {entry.studentName}
                    </span>
                    <span className="text-slate-700 shrink-0">
                      Username: <strong>{entry.username}</strong>
                    </span>
                    <XCircle
                      className="h-4 w-4 text-slate-400 cursor-pointer hover:text-red-500 ml-auto shrink-0"
                      onClick={() =>
                        setSuccessLog((prev) => prev.filter((_, i) => i !== idx))
                      }
                    />
                  </div>
                ))}
              </div>
              {successLog.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full text-slate-500"
                  onClick={() => setSuccessLog([])}
                >
                  Clear All
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
