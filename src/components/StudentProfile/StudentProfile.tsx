import { useState } from "react";
import { X, User, Building2, Camera, CreditCard, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfileDetail from "./ProfileDetail";
import BankDetail from "./BankDetail";
import UploadPhoto from "./UploadPhoto";
import IDCard from "../IdCard";
import TCForm from "../TC";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal } from "@/store/slices/uiSlice";

export default function StudentProfile() {
  const dispatch = useAppDispatch();
  const student = useAppSelector((s) => s.ui.selectedStudent);
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { value: "profile", label: "Profile", icon: User },
    { value: "bank", label: "Bank Details", icon: Building2 },
    { value: "photo", label: "Upload Photo", icon: Camera },
    { value: "idcard", label: "ID Card", icon: CreditCard },
    { value: "tc", label: "TC", icon: FileText },
  ];

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Profile</h2>
              <p className="text-xs text-slate-500">{student.name} • {student.classInfo}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeModal("studentProfile"))}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 pt-4 bg-white border-b border-slate-100 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto bg-slate-50 p-1 gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="profile">
              <ProfileDetail student={student} />
            </TabsContent>

            <TabsContent value="bank">
              <BankDetail studentId={student.id} />
            </TabsContent>

            <TabsContent value="photo">
              <UploadPhoto studentName={student.name} studentId={student.id} />
            </TabsContent>

            <TabsContent value="idcard">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <Printer className="h-5 w-5 shrink-0" />
                  <span>Click the print button on the ID card to print it.</span>
                </div>
                <IDCard />
              </div>
            </TabsContent>

            <TabsContent value="tc">
              <TCForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
