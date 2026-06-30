import React, { useState } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X, Users, Save } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const initialStudents = [
  { id: 'STU-1004', name: 'Wyatt Calloway', initials: 'WC', status: 'present' },
  { id: 'STU-1011', name: 'Liam Delgado', initials: 'LD', status: null },
  { id: 'STU-1019', name: 'Zoe Mercer', initials: 'ZM', status: 'present' },
  { id: 'STU-1022', name: 'Harper Vance', initials: 'HV', status: null },
  { id: 'STU-1026', name: 'Mason Foster', initials: 'MF', status: 'present' },
  { id: 'STU-1027', name: 'Benjamin Voss', initials: 'BV', status: 'present' },
  { id: 'STU-1028', name: 'Henry Mercer', initials: 'HM', status: 'present' },
  { id: 'STU-1032', name: 'Harper Bergström', initials: 'HB', status: 'present' },
];

export default function Attendance() {
  const [students, setStudents] = useState(initialStudents);
  const [date, setDate] = useState(new Date("2026-06-28"));

  // Calculate statistics
  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  const handleStatusChange = (id, newStatus) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  const handleSave = () => {
    console.log("Saving Attendance Data: ", students, "Date:", date);
    alert("Attendance saved successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance</h1>
            <p className="text-sm text-slate-500 mt-1">Mark today's roll call for a class.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Shadcn Select Component */}
            <Select defaultValue="grade6">
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grade6">Grade 6</SelectItem>
                <SelectItem value="grade7">Grade 7</SelectItem>
                <SelectItem value="grade8">Grade 8</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Shadcn DatePicker Component */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal bg-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {date ? format(date, "MM/dd/yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                    initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Present</CardTitle>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Check className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{presentCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Absent</CardTitle>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <X className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{absentCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total roster</CardTitle>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="mb-6 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[300px]">Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Mark Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  
                  {/* Student Avatar & Name */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                        {student.initials}
                      </div>
                      <span className="text-slate-900">{student.name}</span>
                    </div>
                  </TableCell>
                  
                  {/* Student ID */}
                  <TableCell className="text-slate-500">{student.id}</TableCell>
                  
                  {/* Attendance Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant={student.status === 'present' ? 'default' : 'outline'}
                        size="sm"
                        className={student.status === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-slate-600'}
                        onClick={() => handleStatusChange(student.id, 'present')}
                      >
                        Present
                      </Button>
                      
                      <Button
                        variant={student.status === 'absent' ? 'destructive' : 'outline'}
                        size="sm"
                        className={student.status === 'absent' ? '' : 'text-slate-600'}
                        onClick={() => handleStatusChange(student.id, 'absent')}
                      >
                        Absent
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {}
        <Card className="flex flex-col sm:flex-row items-center justify-between p-4">
          <div className="text-sm text-slate-600 mb-4 sm:mb-0">
            <span className="font-semibold text-slate-900">Summary: </span>
            <span className="text-green-600 font-medium">{presentCount} Present</span>,{' '}
            <span className="text-red-600 font-medium">{absentCount} Absent</span> out of {totalCount} students.
          </div>
          
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save attendance
          </Button>
        </Card>

      </div>
    </div>
  );
}