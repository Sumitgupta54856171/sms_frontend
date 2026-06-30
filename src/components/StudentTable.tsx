import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

// Shadcn UI Imports 
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- MOCK API DATA ---
const mockStudents = [
  { id: "1", name: "Aarav Sharma", email: "aarav@mail.com", classInfo: "Class 10 - A", roll: "001", parent: "Rajesh Sharma", status: "Active", color: "bg-teal-500" },
  { id: "2", name: "Priya Patel", email: "priya@mail.com", classInfo: "Class 10 - A", roll: "002", parent: "Amit Patel", status: "Active", color: "bg-indigo-500" },
  { id: "3", name: "Rohan Gupta", email: "rohan@mail.com", classInfo: "Class 9 - B", roll: "003", parent: "Suresh Gupta", status: "Active", color: "bg-blue-500" },
  { id: "4", name: "Ananya Singh", email: "ananya@mail.com", classInfo: "Class 8 - A", roll: "004", parent: "Vikram Singh", status: "Active", color: "bg-teal-500" },
  { id: "5", name: "Kabir Verma", email: "kabir@mail.com", classInfo: "Class 10 - B", roll: "005", parent: "Ajay Verma", status: "Active", color: "bg-indigo-600" },
  { id: "6", name: "Ishita Reddy", email: "ishita@mail.com", classInfo: "Class 7 - A", roll: "006", parent: "Suresh Reddy", status: "Active", color: "bg-teal-500" },
  { id: "7", name: "Arjun Nair", email: "arjun@mail.com", classInfo: "Class 9 - A", roll: "007", parent: "Ramesh Nair", status: "Inactive", color: "bg-teal-500" },
  { id: "8", name: "Meera Joshi", email: "meera@mail.com", classInfo: "Class 11 - A", roll: "008", parent: "Anil Joshi", status: "Active", color: "bg-indigo-500" },
  { id: "9", name: "Neha Verma", email: "neha@mail.com", classInfo: "Class 10 - A", roll: "009", parent: "Sanjay Verma", status: "Active", color: "bg-blue-500" },
  { id: "10", name: "Aditya Kumar", email: "aditya@mail.com", classInfo: "Class 8 - A", roll: "010", parent: "Ravi Kumar", status: "Active", color: "bg-teal-500" },
  { id: "11", name: "Sneha Iyer", email: "sneha@mail.com", classInfo: "Class 9 - B", roll: "011", parent: "Karthik Iyer", status: "Inactive", color: "bg-indigo-500" },
  { id: "12", name: "Rahul Das", email: "rahul@mail.com", classInfo: "Class 10 - B", roll: "012", parent: "Amit Das", status: "Active", color: "bg-teal-600" },
  { id: "13", name: "Kavya Menon", email: "kavya@mail.com", classInfo: "Class 7 - A", roll: "013", parent: "Suresh Menon", status: "Active", color: "bg-blue-600" },
  { id: "14", name: "Vikash Singh", email: "vikash@mail.com", classInfo: "Class 11 - A", roll: "014", parent: "Rajendra Singh", status: "Active", color: "bg-indigo-500" },
  { id: "15", name: "Pooja Reddy", email: "pooja@mail.com", classInfo: "Class 9 - A", roll: "015", parent: "Mahesh Reddy", status: "Active", color: "bg-teal-500" },
  { id: "16", name: "Arnav Goel", email: "arnav@mail.com", classInfo: "Class 10 - A", roll: "016", parent: "Puneet Goel", status: "Inactive", color: "bg-blue-500" },
  { id: "17", name: "Diya Shah", email: "diya@mail.com", classInfo: "Class 8 - A", roll: "017", parent: "Neeraj Shah", status: "Active", color: "bg-teal-500" },
  { id: "18", name: "Karan Johar", email: "karan@mail.com", classInfo: "Class 10 - B", roll: "018", parent: "Yash Johar", status: "Active", color: "bg-indigo-600" },
  { id: "19", name: "Riya Sen", email: "riya@mail.com", classInfo: "Class 7 - A", roll: "019", parent: "Dev Sen", status: "Active", color: "bg-blue-500" },
  { id: "20", name: "Varun Dhawan", email: "varun@mail.com", classInfo: "Class 9 - B", roll: "020", parent: "David Dhawan", status: "Active", color: "bg-teal-600" },
  { id: "21", name: "Alia Bhatt", email: "alia@mail.com", classInfo: "Class 11 - A", roll: "021", parent: "Mahesh Bhatt", status: "Active", color: "bg-indigo-500" },
  { id: "22", name: "Tiger Shroff", email: "tiger@mail.com", classInfo: "Class 10 - A", roll: "022", parent: "Jackie Shroff", status: "Active", color: "bg-blue-600" },
  { id: "23", name: "Shraddha Kapoor", email: "shraddha@mail.com", classInfo: "Class 8 - A", roll: "023", parent: "Shakti Kapoor", status: "Inactive", color: "bg-teal-500" },
  { id: "24", name: "Sid Malhotra", email: "sid@mail.com", classInfo: "Class 9 - A", roll: "024", parent: "Sunil Malhotra", status: "Active", color: "bg-indigo-500" },
  { id: "25", name: "Kiara Advani", email: "kiara@mail.com", classInfo: "Class 10 - B", roll: "025", parent: "Jagdeep Advani", status: "Active", color: "bg-teal-500" },
];

export default function StudentTable() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // API Fetch Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStudents(mockStudents);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter Logic 
  const filteredData = useMemo(() => {
    return students.filter(student => {
      // 1. Class Filter
      const matchesClass = classFilter === "all" || student.classInfo === classFilter;
      
      // 2. Global Search Filter (Name, Email, or Roll)
      const searchTerm = globalFilter.toLowerCase();
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm) || 
        student.email.toLowerCase().includes(searchTerm) ||
        student.roll.toLowerCase().includes(searchTerm);

      return matchesClass && matchesSearch;
    });
  }, [students, classFilter, globalFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [globalFilter, classFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
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
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 bg-white border-slate-200 focus-visible:ring-indigo-500 h-10 shadow-sm"
            />
          </div>

          {/* Class Filter Dropdown */}
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-slate-200 h-10 shadow-sm">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="Class 10 - A">Class 10 - A</SelectItem>
              <SelectItem value="Class 10 - B">Class 10 - B</SelectItem>
              <SelectItem value="Class 9 - A">Class 9 - A</SelectItem>
              <SelectItem value="Class 9 - B">Class 9 - B</SelectItem>
              <SelectItem value="Class 8 - A">Class 8 - A</SelectItem>
              <SelectItem value="Class 7 - A">Class 7 - A</SelectItem>
              <SelectItem value="Class 11 - A">Class 11 - A</SelectItem>
            </SelectContent>
          </Select>

        </div>

        {/* DATA TABLE */}
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">STUDENT</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">CLASS</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">ROLL</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">PARENT</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4">STATUS</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                    Loading students data...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((student) => {
                  const initials = student.name.split(" ").map(n => n[0]).join("");
                  const isActive = student.status === "Active";

                  return (
                    <TableRow key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      
                      {/* Student Cell */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-3 py-2">
                          <Avatar className={`h-10 w-10 text-white ${student.color}`}>
                            <AvatarFallback className="bg-transparent">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-[14px]">{student.name}</span>
                            <span className="text-slate-500 text-[12px]">{student.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Class Cell */}
                      <TableCell className="py-2 text-slate-600 text-sm">
                        {student.classInfo}
                      </TableCell>

                      {/* Roll Cell */}
                      <TableCell className="py-2 text-slate-600 text-sm">
                        {student.roll}
                      </TableCell>

                      {/* Parent Cell */}
                      <TableCell className="py-2 text-slate-600 text-sm">
                        {student.parent}
                      </TableCell>

                      {/* Status Cell */}
                      <TableCell className="py-2">
                        <Badge 
                          variant="outline" 
                          className={`border-transparent font-medium ${isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'}`}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>

                      {/* Actions Cell */}
                      <TableCell className="py-2">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION UI */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white sm:px-6">
          {/* Mobile Pagination View */}
          <div className="flex flex-1 justify-between sm:hidden">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
          
          {/* Desktop Pagination View */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-slate-900">{filteredData.length}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
  );
}