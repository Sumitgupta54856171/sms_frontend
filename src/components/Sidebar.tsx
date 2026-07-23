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
  Mail,
  Smartphone,
  Plus,
  LayoutTemplate,
} from "lucide-react";

import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  "/grades": () => import("@/pages/GradePage/GradePage"),
  "/gmail": () => import("@/pages/GmailPage/GmailPage"),
  "/sms-alert": () => import("@/pages/SmsAlertPage/SmsAlertPage"),
  "/id-card-print": () => import("@/pages/IdCardPrintPage/IdCardPrintPage"),
  "/id-card-template": () => import("@/pages/IdCardTemplate/IdCardTemplate"),
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
      { title: "Grades", url: "/grades", icon: LineChart },
      { title: "Fee Management", url: "/fees", icon: DollarSign, badge: { text: "32", style: "bg-slate-100 text-slate-700 text-xs font-semibold" } },
      { title: "Invoice History", url: "/fees/invoice-history", icon: Receipt },
      { title: "Fee Structure", url: "/fees/structure", icon: IndianRupee },
      { title: "Transfer Certificate", url: "/tc", icon: FileText },
      { title: "Enrollment", url: "/enrollment", icon: ArrowUpDown },
      { title: "ID Card Print", url: "/id-card-print", icon: FileText },
      { title: "ID Card Template", url: "/id-card-template", icon: LayoutTemplate },
    ]
  },
  {
    label: "SERVICES",
    items: [
      { title: "Calendar", url: "/calendar", icon: Calendar },
      { title: "Notice Board", url: "/notices", icon: FileText }
      
    ]
  },
  {
    label: "COMMUNICATION",
    items: [
      { title: "Messages", url: "/messages", icon: MessageSquare },
      { title: "Gmail", url: "/gmail", icon: Mail },
      { title: "SMS Alert", url: "/sms-alert", icon: Smartphone },
    ]
  }
];

export default function SchoolSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

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
  const rawRole = (user?.role || roleFromCookie).replace(/^ROLE_/i, "");
  const isSuperAdmin = rawRole.toLowerCase() === "super_admin";

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
    "Grades",
    "Lesson Plans",
    "Notice Board",
    "Calendar",
    "ID Card Print",
    "ID Card Template",
  ]);

  // Accountant-allowed menu items
  const accountantAllowedTitles = new Set([
    "Fee Management",
    "Invoice History",
    "Fee Structure",
    "Transfer Certificate",
    "Notice Board",
    "Calendar",
    "ID Card Print",
    "ID Card Template",
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
        <Sidebar className="border-r border-slate-200/80 bg-white shadow-sm">
          
          {/* 1. Header (Logo & Brand) */}
          <SidebarHeader className="pt-6 pb-4 px-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-11 w-11 bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-xl shadow-md shadow-teal-500/20 ring-1 ring-white/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">Rose Convent</span>
                <span className="text-[11px] text-slate-500 font-medium">High School</span>
              </div>
            </div>
            {/* Session Switcher — only for super_admin */}
            {isSuperAdmin && <SessionSwitcher />}
          </SidebarHeader>

          {/* 2. Main Content (Links) */}
          <SidebarContent className="px-3">
            
            {/* Independent Dashboard Button */}
            <SidebarMenu className="mt-2 mb-4 px-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/"}
                  className={cn(
                    "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 rounded-xl py-5 px-4 shadow-lg shadow-teal-500/20 ring-1 ring-white/10 transition-all",
                    location.pathname === "/" && "ring-2 ring-teal-300"
                  )}
                >
                  <Link to="/" onMouseEnter={() => preloadPage("/")} className="flex items-center gap-3 w-full">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-semibold text-base">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Dynamic Groups */}
            {filteredMenuGroups.map((group) => (
              <SidebarGroup key={group.label} className="pt-2 pb-0">
                <SidebarGroupLabel className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>{group.label}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(item.url);
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={active}
                            className={cn(
                              "px-3 py-2.5 text-slate-600 hover:bg-slate-100/80 transition-all duration-200 rounded-lg group/item",
                              active && "bg-teal-50/80 text-teal-700 font-semibold shadow-sm"
                            )}
                          >
                            <Link
                              to={item.url}
                              onMouseEnter={() => preloadPage(item.url)}
                              className="flex items-center justify-between w-full"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                  "h-5 w-5 stroke-[1.5] transition-colors",
                                  active ? "text-teal-600" : "text-slate-500 group-hover/item:text-slate-700"
                                )} />
                                <span className="font-medium text-[14px]">{item.title}</span>
                              </div>
                              {item.badge?.text && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge.style}`}>
                                  {item.badge.text}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* 3. Footer (User Profile) */}
          <SidebarFooter className="border-t border-slate-100 p-4 mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full cursor-pointer rounded-xl p-2 hover:bg-slate-100/80 transition-all group/logout"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 text-left min-w-0">
                      <span className="text-sm font-bold text-slate-900 truncate">{displayName}</span>
                      <span className="text-xs text-slate-500 font-medium truncate">{roleLabel}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover/logout:bg-rose-100 group-hover/logout:text-rose-600 transition-colors">
                      <LogOut className="h-4 w-4" />
                    </div>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

        </Sidebar>

        {/* --- MAIN DASHBOARD CONTENT AREA --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent contain-content">
          {/* Top Navbar / Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 lg:px-8 shadow-sm">
            {/* Sidebar Trigger (Hamburger Menu for mobile / Toggle for Desktop) */}
            <SidebarTrigger className="text-slate-500 hover:text-teal-600 hover:bg-slate-100 h-9 w-9 rounded-lg transition-colors" />
            
            <div className="flex-1 flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="text-slate-400">Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold capitalize">
                {location.pathname.split("/")[1] || "Overview"}
              </span>
            </div>
            
            {isSuperAdmin && (
              <Link 
                to="/session" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white h-9 px-4 shadow-sm shadow-teal-500/20 whitespace-nowrap rounded-lg text-sm font-medium transition-all"
              >
                <Plus className="h-4 w-4" />
                New Session
              </Link>
            )}
          </header>

          {/* Page Content Placeholder */}
          <Outlet/>
          
        </main>

      </div>
    </SidebarProvider>
  );
}
