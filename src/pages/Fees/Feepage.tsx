import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  IndianRupee,
  Eye,
  Wallet,
  GraduationCap,
  ArrowUpDown,
  User,
  FileSpreadsheet,
} from "lucide-react";
import Invoice from "@/components/Fees/Invoice";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useDispatch } from "react-redux";
import StudentAvatar from "@/components/StudentAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fetchStudentsByClass } from "@/api/fee";
import { fetchStudents } from "@/api/student";
import { setDetail } from "@/store/slices/detailSlice";

const ALL_CLASSES = [
  "All Classes",
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

const SECTIONS = ["All Sections", "A", "B", "C"];

export default function FeePage() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [payStudent, setPayStudent] = useState<any | null>(null);

  const dispatch = useDispatch();

  // Fetch all students when "All Classes" is selected, otherwise by class
  const isAllClasses = selectedClass === "All Classes";

  const allStudentsQuery = useQuery({
    queryKey: ["all-students"],
    queryFn: fetchStudents,
    enabled: isAllClasses,
  });

  const byClassQuery = useQuery({
    queryKey: ["students-by-class", selectedClass],
    queryFn: () => fetchStudentsByClass(selectedClass),
    enabled: !isAllClasses,
  });

  const students = isAllClasses ? allStudentsQuery.data ?? [] : byClassQuery.data ?? [];
  const isLoading = isAllClasses ? allStudentsQuery.isLoading : byClassQuery.isLoading;

  // Normalize students to a common format
  const normalizedStudents = useMemo(() => {
    if (isAllClasses) {
      // fetchStudents returns a different shape — map it
      return (students as any[]).map((s: any) => ({
        id: s.id,
        name: s.name ?? "",
        scholarNo: s.scholar_no ?? "-",
        rollNo: s.roll ?? "-",
        className: s.classInfo ?? "-",
        section: s.section ?? "A",
        parent: s.parent ?? "-",
        phone: s.phone ?? "-",
        status: s.status ?? "active",
        enrollmentId: s.enrollment?.[0]?.enrollmentId,
      }));
    }
    // fetchStudentsByClass already returns the right shape
    return (students as any[]).map((s: any) => ({
      ...s,
      section: s.section ?? "A",
    }));
  }, [students, isAllClasses]);

  // Filter + sort
  const filteredStudents = useMemo(() => {
    let list = normalizedStudents;

    // Filter by section
    if (selectedSection !== "All Sections") {
      list = list.filter((s: any) => s.section === selectedSection);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s: any) =>
          s.name?.toLowerCase().includes(q) ||
          s.scholarNo?.toLowerCase().includes(q) ||
          s.rollNo?.toLowerCase().includes(q) ||
          s.parent?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a: any, b: any) => {
      const aNum = parseInt(a.rollNo) || 0;
      const bNum = parseInt(b.rollNo) || 0;
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [normalizedStudents, searchQuery, sortOrder, selectedSection]);

  // If paying fees for a student
  if (payStudent) {
    return (
      <Invoice
        student={payStudent}
        onClose={() => setPayStudent(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Fee Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View all students or filter by class &amp; section to manage fees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-44 bg-white">
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Students</p>
                  <p className="text-xl font-bold text-slate-900">{normalizedStudents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Class</p>
                  <p className="text-xl font-bold text-slate-900">{selectedClass}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Section</p>
                  <p className="text-xl font-bold text-slate-900">{selectedSection}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Session</p>
                  <p className="text-xl font-bold text-slate-900">2026-2027</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, scholar no, roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Roll No {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>

        {/* Student Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Students
              {selectedClass !== "All Classes" && <span> — {selectedClass}</span>}
              <span className="text-sm font-normal text-slate-400 ml-2">
                ({filteredStudents.length} students)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No students found</p>
                <p className="text-xs mt-1">
                  {searchQuery
                    ? "Try a different search term."
                    : "No students enrolled."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Scholar No.</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student: any, index: number) => (
                    <TableRow
                      key={student.id ?? index}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="text-sm text-slate-400 font-mono">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <StudentAvatar
                            studentId={student.id}
                            studentName={student.name}
                            className="h-8 w-8"
                            fallbackClassName="bg-indigo-100 text-indigo-700 text-xs font-semibold"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400">{student.className}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono text-slate-600">
                          {student.scholarNo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">
                          {student.rollNo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {student.section}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {student.parent}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {student.phone}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              sessionStorage.setItem("feesStudent", JSON.stringify(student));
                              navigate("/student/feesprofile");
                            }}
                            className="gap-1.5 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Fees
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              dispatch(setDetail(student));
                              setPayStudent(student);
                            }}
                            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Wallet className="h-3.5 w-3.5" />
                            Pay Fees
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
