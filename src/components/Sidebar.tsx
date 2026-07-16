import { useMemo, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Presentation,
  Building2,
  Book,
  Calendar,
  ClipboardCheck,
  FileText,
  LineChart,
  DollarSign,
  IndianRupee,
  Receipt,
  Library,
  Bus,
  BedDouble,
  MessageSquare,
  LogOut,
  ArrowUpDown,

} from "lucide-react";

import { Outlet, Link, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/AuthProvider";
import SessionSwitcher from "@/components/SessionSwitcher";
import { getCookie } from "@/lib/utils";
import { fetchAndCacheTeacherClass } from "@/api/teacher";

// ─── Page preloaders — call import() on hover so chunks load before click ───
const pagePreloaders: Record<string, () => Promise<unknown>> = {
  "/students": () => import("@/pages/Studentpage/Studentpage"),
  "/teachers": () => import("@/pages/Teacher/Teacherpage"),
  "/class": () => import("@/pages/classpage/Classpage"),
  "/subjects": () => import("@/pages/Subjectpage/Subjectpage"),
  "/timetable": () => import("@/pages/Timetablepage"),
  "/lesson-plans": () => import("@/pages/TeacherPlan/TeacherPlanPage"),
  "/attendance": () => import("@/pages/Attendence/Attendecepage"),
  "/timetable/exams": () => import("@/pages/ExamTimetable/ExamTimetablePage"),
  "/fees": () => import("@/pages/Fees/Feepage"),
  "/fees/invoice-history": () => import("@/pages/InvoiceHistory/InvoiceHistoryPage"),
  "/fees/structure": () => import("@/pages/FeeStructurepage/FeeStructurepage"),
  "/tc": () => import("@/pages/TC/TCpage"),
  "/enrollment": () => import("@/pages/Enrollment/EnrollmentPage"),
  "/calendar": () => import("@/pages/CalendarPage/CalendarPage"),
  "/notices": () => import("@/pages/NoticeBoardPage/NoticeBoardPage"),
  "/messages": () => import("@/pages/MessagesPage/MessagesPage"),
};

// Grouped Menu Items matching the screenshot
const menuGroups = [
  {
    label: "ACADEMICS",
    items: [
      { title: "Students", url: "/students", icon: GraduationCap, badge: { text: "", style: "bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold" } },
      { title: "Teachers", url: "/teachers", icon: Presentation, badge: { text: "", style: "text-purple-600 text-xs font-semibold" } },
      { title: "Classes & Sections", url: "/class", icon: Building2 },
      { title: "Subjects", url: "/subjects", icon: Book },
      { title: "Timetable", url: "/timetable", icon: Calendar },
      { title: "Lesson Plans", url: "/lesson-plans", icon: FileText },
    ]
  },
  {
    label: "OPERATIONS",
    items: [
      { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
      { title: "Examinations", url: "/timetable/exams", icon: FileText },
      { title: "Grades", url: "#", icon: LineChart },
      { title: "Fee Management", url: "/fees", icon: DollarSign, badge: { text: "32", style: "text-slate-700 text-xs font-semibold" } },
      { title: "Invoice History", url: "/fees/invoice-history", icon: Receipt },
      { title: "Fee Structure", url: "/fees/structure", icon: IndianRupee },
      { title: "Transfer Certificate", url: "/tc", icon: FileText },
      { title: "Enrollment", url: "/enrollment", icon: ArrowUpDown },
    ]
  },
  {
    label: "SERVICES",
    items: [
      { title: "Calendar", url: "/calendar", icon: Calendar },
      { title: "Notice Board", url: "/notices", icon: FileText },
      { title: "Library", url: "#", icon: Library },
      { title: "Transport", url: "#", icon: Bus },
      { title: "Hostel", url: "#", icon: BedDouble },
    ]
  },
  {
    label: "COMMUNICATION",
    items: [
      { title: "Messages", url: "/messages", icon: MessageSquare },
    ]
  }
];

export default function SchoolSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  // Read role from cookie — backend sets a cookie named "role"
  const roleFromCookie = (getCookie("role") || "").replace(/^ROLE_/i, "");
  const isTeacher = roleFromCookie.toLowerCase() === "teacher";
  const isAccountant = roleFromCookie.toLowerCase() === "accountant";

  // Ensure teacher's class is cached in localStorage (runs on every protected route)
  useEffect(() => {
    if (isTeacher && !localStorage.getItem("className")) {
      fetchAndCacheTeacherClass();
    }
  }, [isTeacher]);

  // Teacher-allowed menu items
  const teacherAllowedTitles = new Set([
    "Attendance",
    "Timetable",
    "Classes & Sections",
    "Examinations",
    "Lesson Plans",
  ]);

  // Accountant-allowed menu items — only fees, invoices, fee structure, and TC
  const accountantAllowedTitles = new Set([
    "Fee Management",
    "Invoice History",
    "Fee Structure",
    "Transfer Certificate",
  ]);

  // Filter menu groups based on role
  const filteredMenuGroups = useMemo(() => {
    if (isAccountant) {
      return menuGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => accountantAllowedTitles.has(item.title)),
        }))
        .filter((group) => group.items.length > 0);
    }

    if (isTeacher) {
      return menuGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => teacherAllowedTitles.has(item.title)),
        }))
        .filter((group) => group.items.length > 0);
    }

    return menuGroups;
  }, [isTeacher, isAccountant]);

  // Preload page chunk on hover so navigation is instant
  const preloadPage = useCallback((url: string) => {
    const loader = pagePreloaders[url];
    if (loader) {
      loader().catch(() => {}); // silent — just warming the cache
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        
        {/* --- SHADCN SIDEBAR COMPONENT --- */}
        <Sidebar className="border-r border-slate-200 bg-white">
          
          {/* 1. Header (Logo & Brand) */}
          <SidebarHeader className="pt-6 pb-2 px-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 bg-[#0d9488] text-white rounded-xl shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[1.1rem] tracking-tight text-slate-900 leading-tight">Rose Convent High School</span>
                <span className="text-[11px] text-slate-500">v3.2.0 </span>
              </div>
            </div>
            {/* Session Switcher — for admin and accountant roles, not teachers */}
            {!isTeacher && <SessionSwitcher />}
          </SidebarHeader>

          {/* 2. Main Content (Links) */}
          <SidebarContent className="px-3">
            
            {/* Independent Dashboard Button */}
            <SidebarMenu className="mt-4 mb-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={true}
                  className="bg-[#0d9488] text-white hover:bg-teal-700 hover:text-white rounded-lg py-5 px-3 shadow-md"
                >
                  <Link to="/" onMouseEnter={() => preloadPage("/")} className="flex items-center gap-3 w-full">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium text-base">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Dynamic Groups */}
            {filteredMenuGroups.map((group) => (
              <SidebarGroup key={group.label} className="pt-2 pb-0 contain-content">
                <SidebarGroupLabel className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className="px-2 py-4 text-slate-600 hover:bg-slate-50 transition-colors rounded-lg"
                        >
                          <Link
                            to={item.url}
                            onMouseEnter={() => preloadPage(item.url)}
                            className="flex items-center justify-between w-full"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 text-slate-600 stroke-[1.5]" />
                              <span className="font-medium text-[15px]">{item.title}</span>
                            </div>
                            
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* 3. Footer (User Profile) */}
          <SidebarFooter className="border-t border-slate-100 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full cursor-pointer rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 text-left">
                      <span className="text-[14px] font-bold text-slate-900">{displayName}</span>
                      <span className="text-[12px] text-slate-500">{roleLabel}</span>
                    </div>
                    <LogOut className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors mr-1" />
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

        </Sidebar>

        {/* --- MAIN DASHBOARD CONTENT AREA --- */}
        
            <main className="flex-1 flex flex-col min-w-0 bg-white contain-content">
          {/* Top Navbar / Header */}
          <header className="flex h-14 items-center gap-4 border-b border-slate-100 bg-white px-4 lg:px-6">
            {/* Sidebar Trigger (Hamburger Menu for mobile / Toggle for Desktop) */}
            <SidebarTrigger className="text-slate-500 hover:text-teal-700" />
            
            <div className="flex-1 font-semibold text-slate-800 text-sm">
              Dashboard / Students
            </div>
            {!isAccountant && (
              <span className="bg-[#0d9488] hover:bg-teal-700 text-white h-10 shadow-sm whitespace-nowrap rounded-xl justify-center content-center text-center ">
                <Link className="text-white h-4 w-4 mr-1.5 p-4" to="/session">New Session</Link>
              </span>
            )}
          </header>

          {/* Page Content Placeholder */}
          <Outlet/>
          
        </main>

      </div>
    </SidebarProvider>
  );
}