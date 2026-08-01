import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Shadcn UI Imports
import { Input } from "@/components/ui/input";
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
import { Spinner } from "@/components/ui/spinner";

import { fetchStudentList, type StudentListItem } from "@/api/student";
import StudentForm from "./Studentform";
import StudentAvatar from "./StudentAvatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openModal, closeModal } from "@/store/slices/uiSlice";

const colorPalette = [
  "bg-teal-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
];

export default function StudentTable() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const showForm = useAppSelector((s) => s.ui.modals.studentForm);
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ["student-list"],
    queryFn: fetchStudentList,
  });

  // Filter Logic
  const filteredData = useMemo(() => {
    const searchTerm = globalFilter.toLowerCase();
    return students.filter((student: StudentListItem) => {
      return (
        student.studentName?.toLowerCase().includes(searchTerm) ||
        student.scholarNo?.toLowerCase().includes(searchTerm)
      );
    });
  }, [students, globalFilter]);

  // Reset to page 1 when filters change
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getColor = (index: number) => colorPalette[index % colorPalette.length];

  const handleViewProfile = (student: StudentListItem) => {
    localStorage.setItem("selectedStudentId", String(student.studentId));
    navigate(`/student/profile/${student.studentId}`);
  };

  return (
    <>
      {showForm && <StudentForm onClose={() => dispatch(closeModal("studentForm"))} />}
      

      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
          {/* TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border-b border-slate-100">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                placeholder="Search by name, roll, email..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-white border-slate-200 focus-visible:ring-indigo-500 h-10 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={() => dispatch(openModal("studentForm"))}
                className="bg-[#0d9488] hover:bg-teal-700 text-white h-10 shadow-sm whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Student
              </Button>
            </div>
          </div>

        {/* DATA TABLE */}
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Photo</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">STUDENT</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">SCHOLAR NO</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">FATHER'S NAME</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">MOTHER'S NAME</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">STATUS</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-5 w-5" />
                      <span>Loading students...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-red-500">
                    Failed to load students. Please try again.
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((student: any, idx: number) => {
                  const initials = student.studentName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("");
                  const isActive = student.status === "Active" || student.status === "active";

                  return (
                    <TableRow
                      key={student.StudentId}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                          <TableCell className="py-2">
                        <div className="flex items-center gap-3 py-2">
                          <StudentAvatar
                            studentId={student.studentId}
                            studentName={student.studentName}
                            className="h-10 w-10"
                          />
                          
                        </div>
                      </TableCell>
                      {/* Student Cell */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-3 py-2">
                          
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-[14px]">
                              {student.studentName}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Scholar No Cell */}
                      <TableCell className="py-2 text-slate-600 text-sm">
                        {student.scholarNo || "-"}
                      </TableCell>

                      {/* Father's Name Cell */}
                      <TableCell className="py-2 text-slate-600 text-sm">
                        {student.faterhName || "-"}
                      </TableCell>

                      {/* Mother's Name Cell */}
                      <TableCell className="py-2 text-slate-600 text-sm">
                        {student.motherName || "-"}
                      </TableCell>

                      {/* Status Cell */}
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={`border-transparent font-medium ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>

                      {/* Actions Cell */}
                      <TableCell className="py-2">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-600"
                            onClick={() => handleViewProfile(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-slate-500"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION UI */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredData.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * itemsPerPage, filteredData.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {filteredData.length}
                </span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <div className="text-sm font-medium text-slate-600 px-2">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}