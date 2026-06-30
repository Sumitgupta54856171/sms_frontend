import React from "react";
import { 
  Download, 
  Plus, 
  Mail, 
  Phone, 
  PenLine 
} from "lucide-react";

// Shadcn UI Imports (Make sure you have these installed)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// --- MOCK TEACHERS DATA ---
const teachersData = [
  {
    id: "EMP-001",
    name: "Mr. Robert Brown",
    subject: "Mathematics",
    experience: "8 years exp.",
    tags: [
      { label: "Grade 9-10", colorClass: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
      { label: "Algebra", colorClass: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" }
    ],
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "EMP-002",
    name: "Ms. Jennifer Davis",
    subject: "English Literature",
    experience: "12 years exp.",
    tags: [
      { label: "Grade 6-12", colorClass: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
      { label: "Literature", colorClass: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" }
    ],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "EMP-003",
    name: "Dr. Michael Taylor",
    subject: "Physics",
    experience: "15 years exp.",
    tags: [
      { label: "Grade 11-12", colorClass: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
      { label: "Physics", colorClass: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" }
    ],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: "EMP-004",
    name: "Mrs. Lisa Anderson",
    subject: "Chemistry",
    experience: "10 years exp.",
    tags: [
      { label: "Grade 9-12", colorClass: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
      { label: "Chemistry", colorClass: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" }
    ],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150"
  }
];

export default function TeacherManagement() {
  return (
    <div className="min-h-screen bg-[#f4f7fa] p-6 md:p-8 font-sans text-slate-900">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Teachers Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage faculty members, schedules, and assignments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* --- TEACHERS GRID --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teachersData.map((teacher, index) => (
          <Card 
            key={index} 
            className="border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden"
          >
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              
              {/* Teacher Avatar with subtle border */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-sm transform scale-110 opacity-50"></div>
                <Avatar className="h-20 w-20 border-2 border-white shadow-sm relative z-10">
                  <AvatarImage src={teacher.image} alt={teacher.name} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                    {teacher.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Teacher Info */}
              <h3 className="font-bold text-base text-slate-800 mb-0.5">
                {teacher.name}
              </h3>
              <p className="text-sm text-slate-600 font-medium mb-1.5">
                {teacher.subject}
              </p>
              
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5 mb-5">
                <span>{teacher.id}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{teacher.experience}</span>
              </div>

              {/* Tags / Badges */}
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {teacher.tags.map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className={`font-medium px-2.5 py-0.5 ${tag.colorClass}`}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
              
            </CardContent>

            {/* Footer Actions */}
            <div className="px-6 pb-6">
              <div className="border-t border-slate-100 pt-4 flex justify-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors">
                  <Mail className="h-4 w-4 fill-current" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                  <Phone className="h-4 w-4 fill-current" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                  <PenLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
          </Card>
        ))}
      </div>

    </div>
  );
}