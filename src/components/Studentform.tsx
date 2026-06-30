import { useState } from 'react';
import { X } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function StudentForm() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <Button onClick={() => setIsOpen(true)}>Open Add Student Form</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans">
      {/* Dialog Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Add New Student</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
            <div>
              <Label htmlFor="fullName" className="mb-1.5 block">Full Name <span className="text-red-500">*</span></Label>
              <Input id="fullName" placeholder="Enter student's full name" />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">Email <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" placeholder="student@example.com" />
            </div>

            <div>
              <Label htmlFor="class" className="mb-1.5 block">Class <span className="text-red-500">*</span></Label>
              <Select>
                <SelectTrigger id="class"><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Class 1</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section" className="mb-1.5 block">Section <span className="text-red-500">*</span></Label>
              <Select>
                <SelectTrigger id="section"><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rollNo" className="mb-1.5 block">Roll No <span className="text-red-500">*</span></Label>
              <Input id="rollNo" placeholder="e.g. 101" />
            </div>
            <div>
              <Label htmlFor="scholarNo" className="mb-1.5 block">Scholar Number <span className="text-red-500">*</span></Label>
              <Input id="scholarNo" placeholder="Enter Scholar No." />
            </div>

            <div>
              <Label htmlFor="sssmid" className="mb-1.5 block">SSSMID <span className="text-red-500">*</span></Label>
              <Input id="sssmid" placeholder="9 Digit SSSMID" maxLength={9} />
            </div>
            <div>
              <Label htmlFor="aadhaar" className="mb-1.5 block">Aadhaar Number <span className="text-red-500">*</span></Label>
              <Input id="aadhaar" placeholder="12 Digit Aadhaar" maxLength={12} />
            </div>

            <div>
              <Label htmlFor="gender" className="mb-1.5 block">Gender <span className="text-red-500">*</span></Label>
              <Select>
                <SelectTrigger id="gender"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category" className="mb-1.5 block">Category <span className="text-red-500">*</span></Label>
              <Select>
                <SelectTrigger id="category"><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="st">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dob" className="mb-1.5 block">Date of Birth <span className="text-red-500">*</span></Label>
              <Input id="dob" type="date" className="block w-full" />
            </div>
            <div>
              <Label htmlFor="phone" className="mb-1.5 block">Phone <span className="text-red-500">*</span></Label>
              <Input id="phone" type="tel" placeholder="Enter 10 digit number" />
            </div>

            <div>
              <Label htmlFor="fatherName" className="mb-1.5 block">Father Name <span className="text-red-500">*</span></Label>
              <Input id="fatherName" placeholder="Enter father's name" />
            </div>
            <div>
              <Label htmlFor="motherName" className="mb-1.5 block">Mother Name <span className="text-red-500">*</span></Label>
              <Input id="motherName" placeholder="Enter mother's name" />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="status" className="mb-1.5 block">Status</Label>
              <Select>
                <SelectTrigger id="status"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)} className="w-full sm:w-auto bg-[#0d9488] hover:bg-teal-700 text-white">
            Add Student
          </Button>
        </div>

      </div>
    </div>
  );
}