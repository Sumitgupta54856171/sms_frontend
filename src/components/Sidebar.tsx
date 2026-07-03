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
  Library,
  Bus,
  BedDouble,
  MessageSquare,
  LogOut,
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

// Grouped Menu Items matching the screenshot
const menuGroups = [
  {
    label: "ACADEMICS",
    items: [
      { title: "Students", url: "/students", icon: GraduationCap, badge: { text: "1,248", style: "bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold" } },
      { title: "Teachers", url: "/teachers", icon: Presentation, badge: { text: "86", style: "text-purple-600 text-xs font-semibold" } },
      { title: "Classes & Sections", url: "/class", icon: Building2 },
      { title: "Subjects", url: "#", icon: Book },
      { title: "Timetable", url: "/timetable", icon: Calendar },
    ]
  },
  {
    label: "OPERATIONS",
    items: [
      { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
      { title: "Examinations", url: "#", icon: FileText },
      { title: "Grades", url: "#", icon: LineChart },
      { title: "Fees", url: "#", icon: DollarSign, badge: { text: "32", style: "text-slate-700 text-xs font-semibold" } },
    ]
  },
  {
    label: "SERVICES",
    items: [
      { title: "Library", url: "#", icon: Library },
      { title: "Transport", url: "#", icon: Bus },
      { title: "Hostel", url: "#", icon: BedDouble },
    ]
  },
  {
    label: "COMMUNICATION",
    items: [
      { title: "Messages", url: "#", icon: MessageSquare },
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
          <SidebarHeader className="pt-6 pb-2 px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 bg-indigo-600 text-white rounded-xl shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[1.1rem] tracking-tight text-slate-900 leading-tight">EduPro</span>
                <span className="text-[11px] text-slate-500">v3.2.0 Enterprise</span>
              </div>
            </div>
          </SidebarHeader>

          {/* 2. Main Content (Links) */}
          <SidebarContent className="px-3">
            
            {/* Independent Dashboard Button */}
            <SidebarMenu className="mt-4 mb-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={true}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white rounded-lg py-5 px-3 shadow-md"
                >
                  <a href="#" className="flex items-center gap-3 w-full">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium text-base">Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Dynamic Groups */}
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label} className="pt-2 pb-0">
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
                          <Link to={item.url} className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <item.icon className="h-5 w-5 text-slate-600 stroke-[1.5]" />
                              <span className="font-medium text-[15px]">{item.title}</span>
                            </div>
                            {item.badge && (
                              <span className={item.badge.style}>{item.badge.text}</span>
                            )}
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
        
            <main className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top Navbar / Header */}
          <header className="flex h-14 items-center gap-4 border-b border-slate-100 bg-white px-4 lg:px-6">
            {/* Sidebar Trigger (Hamburger Menu for mobile / Toggle for Desktop) */}
            <SidebarTrigger className="text-slate-500 hover:text-teal-700" />
            
            <div className="flex-1 font-semibold text-slate-800 text-sm">
              Dashboard / Students
            </div>
            <span className="bg-[#0d9488] hover:bg-teal-700 text-white h-10 shadow-sm whitespace-nowrap rounded-xl justify-center content-center text-center "><Link  className="text-white h-4 w-4 mr-1.5 p-4" to="/session">New Session</Link></span>
          </header>

          {/* Page Content Placeholder */}
          <Outlet/>
          
        </main>

      </div>
    </SidebarProvider>
  );
}