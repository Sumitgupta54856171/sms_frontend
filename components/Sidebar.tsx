"use client";

import {
  GraduationCap,
  LayoutDashboard,
  UserGraduation,
  ChalkboardTeacher,
  School,
  Calendar,
  ClipboardCheck,
  FileText,
  TrendingUp,
  DollarSign,
  BookOpen,
  Bus,
  Bed,
  Megaphone,
  Mail,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Book,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuGroups = [
  {
    title: "Academics",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "#", active: true },
      { title: "Students", icon: UserGraduation, href: "#", badge: "1,248" },
      { title: "Teachers", icon: ChalkboardTeacher, href: "#", badge: "86", badgeColor: "bg-purple-100 text-purple-700" },
      { title: "Classes & Sections", icon: School, href: "#" },
      { title: "Subjects", icon: Book, href: "#" },
      { title: "Timetable", icon: Calendar, href: "#" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Attendance", icon: ClipboardCheck, href: "#" },
      { title: "Examinations", icon: FileText, href: "#" },
      { title: "Grades", icon: TrendingUp, href: "#" },
      { title: "Fees", icon: DollarSign, href: "#", badge: "32", badgeColor: "bg-yellow-100 text-yellow-800" },
    ],
  },
  {
    title: "Services",
    items: [
      { title: "Library", icon: BookOpen, href: "#" },
      { title: "Transport", icon: Bus, href: "#" },
      { title: "Hostel", icon: Bed, href: "#" },
    ],
  },
  {
    title: "Communication",
    items: [
      { title: "Notices", icon: Megaphone, href: "#" },
      { title: "Messages", icon: Mail, href: "#", badge: "5", badgeColor: "bg-red-500 text-white" },
      { title: "Events", icon: CalendarDays, href: "#" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { title: "Reports", icon: BarChart3, href: "#" },
      { title: "Settings", icon: Settings, href: "#" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-xl fixed h-screen z-30 flex flex-col border-r">
      {/* Header / Logo */}
      <div className="p-5 border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-gray-800">EduPro</h1>
          <p className="text-xs text-gray-500">v3.2.0 Enterprise</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6 text-sm">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="text-xs uppercase text-gray-400 px-3 pb-1 font-semibold">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-gray-100 ${
                      item.active
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-gradient-to-r"
                        : "text-gray-700"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge
                        className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          item.badgeColor || "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer / User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://i.pravatar.cc/40?img=12" alt="Dr. Sarah Mitchell" />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">Dr. Sarah Mitchell</p>
            <p className="text-xs text-gray-500 truncate">Super Admin</p>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
