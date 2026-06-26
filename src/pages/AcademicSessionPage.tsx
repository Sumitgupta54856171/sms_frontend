import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AcademicSessionPage() {
  const [search, setSearch] = useState("");

  const sessions = [
    { id: 1, name: "Fall Semester 2023", start: "2023-08-20", end: "2023-12-15", status: "Completed" },
    { id: 2, name: "Spring Semester 2024", start: "2024-01-10", end: "2024-05-25", status: "Active" },
    { id: 3, name: "Summer Term 2024", start: "2024-06-01", end: "2024-08-15", status: "Upcoming" },
    { id: 4, name: "Fall Semester 2024", start: "2024-08-19", end: "2024-12-20", status: "Upcoming" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#fafafa] font-sans p-8 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-[#2563eb]" />
              Academic Sessions
            </h1>
            <p className="text-sm text-slate-500">Manage and configure the academic terms for Lindenwood Academy.</p>
          </div>
          <Button className="bg-[#111827] hover:bg-black text-white gap-2 text-sm font-medium transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>

        {/* Table Card */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-slate-900">All Sessions</CardTitle>
                <CardDescription className="text-xs text-slate-500">A list of all academic sessions in the system.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search sessions..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11 bg-white border-slate-200 focus-visible:ring-slate-400 placeholder:text-slate-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50 border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-medium text-slate-600">Session Name</TableHead>
                  <TableHead className="text-xs font-medium text-slate-600">Start Date</TableHead>
                  <TableHead className="text-xs font-medium text-slate-600">End Date</TableHead>
                  <TableHead className="text-xs font-medium text-slate-600">Status</TableHead>
                  <TableHead className="text-right text-xs font-medium text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="border-slate-100 hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{session.name}</TableCell>
                    <TableCell className="text-slate-600">{new Date(session.start).toLocaleDateString()}</TableCell>
                    <TableCell className="text-slate-600">{new Date(session.end).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          session.status === "Active" 
                            ? "bg-blue-50 text-[#2563eb] border-blue-200" 
                            : session.status === "Upcoming"
                            ? "bg-slate-50 text-slate-600 border-slate-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }
                      >
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
