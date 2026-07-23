import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  Megaphone,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Building2,
  School,
  BarChart3,
  Sparkles,
  IndianRupee,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/store/hooks";
import { fetchStudents, fetchStudentsByClass } from "@/api/student";
import { fetchTeachers } from "@/api/teacher";
import { fetchAttendanceByDate } from "@/api/attendance";
import { fetchEvents, type EventItem } from "@/api/event";
import { fetchNotices, type NoticeItem } from "@/api/notice";
import { fetchEnrollmentByClass } from "@/api/enrollment";
import { fetchFeeDashboardStats } from "@/api/fee";

// ─── Color palette ─────────────────────────────────────────────────────
const COLORS = {
  teal: "#0d9488",
  tealLight: "#14b8a6",
  tealDark: "#0f766e",
  amber: "#f59e0b",
  rose: "#f43f5e",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#10b981",
  slate: "#64748b",
  orange: "#f97316",
  indigo: "#6366f1",
  pink: "#ec4899",
};

// ─── Stat Card ─────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color,
  subtitle,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendLabel?: string;
  color: string;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <div className="group relative bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: color }} />
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ) : (
        <div className="relative flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl shadow-sm ring-1 ring-black/5" style={{ backgroundColor: `${color}15` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trend === 'up' ? 'Up' : 'Down'}</span>
              </div>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 font-medium mt-1 truncate">{subtitle}</p>}
            {trendLabel && <p className="text-[11px] text-slate-500 mt-2 font-medium truncate">{trendLabel}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Component ───────────────────────────────────────────────
export default function Dashboard() {
  const userRole = useAppSelector((s) => s.auth.user?.role ?? "");
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const normalizedRole = userRole.replace(/^ROLE_/i, "").toLowerCase();
  const isAdmin = ["admin", "super_admin"].includes(normalizedRole);
  const isTeacher = normalizedRole === "teacher";

  const today = format(new Date(), "yyyy-MM-dd");

  // ── Queries ──────────────────────────────────────────────────────────
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    enabled: isAdmin,
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
    enabled: isAdmin,
  });

  const attendanceQuery = useQuery({
    queryKey: ["attendance", today],
    queryFn: () => fetchAttendanceByDate(today),
    enabled: isAdmin || isTeacher,
  });

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const noticesQuery = useQuery({
    queryKey: ["notices"],
    queryFn: fetchNotices,
  });

  const enrollmentQuery = useQuery({
    queryKey: ["enrollment-by-class"],
    queryFn: fetchEnrollmentByClass,
    enabled: isAdmin,
  });

  const feeDashboardQuery = useQuery({
    queryKey: ["fee-dashboard-stats"],
    queryFn: fetchFeeDashboardStats,
    enabled: isAdmin,
  });

  // Teacher's class students
  const teacherClassName = localStorage.getItem("className") || "";
  const teacherStudentsQuery = useQuery({
    queryKey: ["teacher-students", teacherClassName],
    queryFn: () => fetchStudentsByClass(teacherClassName),
    enabled: isTeacher && !!teacherClassName,
    select: (data: any) => data?.studentdetail ?? [],
  });

  // Teacher's weekly attendance trend (last 7 days)
  const last7Days = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      days.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
    }
    return days;
  }, []);

  const weeklyAttendanceQuery = useQuery({
    queryKey: ["weekly-attendance", ...last7Days],
    queryFn: async () => {
      const results: { date: string; present: number; absent: number; total: number }[] = [];
      for (const date of last7Days) {
        const records = await fetchAttendanceByDate(date);
        const present = records.filter((r) => r.status === "present").length;
        const absent = records.filter((r) => r.status === "absent").length;
        results.push({ date, present, absent, total: records.length });
      }
      return results;
    },
    enabled: isAdmin || isTeacher,
  });

  // ── Derived Data ─────────────────────────────────────────────────────
  const students: any[] = isTeacher ? (teacherStudentsQuery.data ?? []) : (studentsQuery.data ?? []);
  const teachers: any[] = teachersQuery.data ?? [];
  const attendanceRecords: any[] = attendanceQuery.data ?? [];
  const events: EventItem[] = eventsQuery.data ?? [];
  const notices: NoticeItem[] = noticesQuery.data ?? [];
  const enrollmentByClassData: any[] = enrollmentQuery.data ?? [];
  const feeStats = feeDashboardQuery.data ?? { totalFees: 0, totalCollection: 0, todayCollection: 0, dueFees: 0 };

  // Student stats
  const totalStudents = students.length;
  const activeStudents = students.filter((s: any) => (s.status?.toLowerCase() === "active")).length;
  const alumniStudents = students.filter((s: any) =>
    ["inactive", "left", "alumni"].includes(s.status?.toLowerCase())
  ).length;
  const maleStudents = students.filter((s: any) => s.gender?.toLowerCase() === "male").length;
  const femaleStudents = students.filter((s: any) => s.gender?.toLowerCase() === "female").length;

  // Teacher stats
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t: any) => t.status?.toLowerCase() === "active").length;

  // Teacher's class student count
  const teacherClassStudentCount = isTeacher ? students.length : 0;

  // Attendance stats
  const presentCount = attendanceRecords.filter((r: any) => r.status === "present").length;
  const absentCount = attendanceRecords.filter((r: any) => r.status === "absent").length;
  const totalAttendance = attendanceRecords.length;
  const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Enrollment stats — API returns array of class name strings, each entry = one enrollment
  const totalEnrollments = enrollmentByClassData.length;

  // Weekly attendance chart data for teachers
  const weeklyAttendanceData = useMemo(() => {
    const data = weeklyAttendanceQuery.data ?? [];
    return data.map((d) => ({
      day: format(new Date(d.date), "EEE"),
      present: d.present,
      absent: d.absent,
      total: d.total,
    }));
  }, [weeklyAttendanceQuery.data]);

  // Upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events
      .filter((e) => {
        const d = new Date(e.eventdate);
        return d >= now && d <= nextWeek;
      })
      .sort((a, b) => new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime())
      .slice(0, 5);
  }, [events]);

  // Recent notices (last 5)
  const recentNotices = useMemo(() => {
    return [...notices]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [notices]);

  // Enrollment chart data — API returns array of class name strings like ["6","6","9"]
  const enrollmentChartData = useMemo(() => {
    const countMap: Record<string, number> = {};
    enrollmentByClassData.forEach((item: any) => {
      const className = `Class ${item}`;
      countMap[className] = (countMap[className] || 0) + 1;
    });
    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [enrollmentByClassData]);

  // Gender distribution
  const genderData = useMemo(() => {
    if (isAdmin) {
      return [
        { name: "Boys", value: maleStudents, color: COLORS.blue },
        { name: "Girls", value: femaleStudents, color: COLORS.rose },
      ];
    }
    // Teacher sees their class student gender ratio
    const male = students.filter((s: any) => s.gender?.toLowerCase() === "male").length;
    const female = students.filter((s: any) => s.gender?.toLowerCase() === "female").length;
    return [
      { name: "Boys", value: male, color: COLORS.blue },
      { name: "Girls", value: female, color: COLORS.rose },
    ];
  }, [isAdmin, maleStudents, femaleStudents, students]);

  // Students by class (for additional chart)
  const studentsByClass = useMemo(() => {
    const classMap: Record<string, number> = {};
    students.forEach((s: any) => {
      const cls = s.classInfo || "Unknown";
      classMap[cls] = (classMap[cls] || 0) + 1;
    });
    return Object.entries(classMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-4 md:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#0d9488] blur-2xl opacity-20 animate-pulse" />
              <div className="relative p-3 bg-gradient-to-br from-[#0d9488] to-teal-600 text-white rounded-2xl shadow-lg shadow-[#0d9488]/20">
                <School className="h-7 w-7" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {currentSession
                  ? `${currentSession.sessionName} · ${format(new Date(), "MMMM yyyy")}`
                  : "School Management System"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm text-slate-500 font-medium">
              <Clock className="h-4 w-4 text-slate-400" />
              {format(new Date(), "EEEE, MMMM dd, yyyy")}
            </div>
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm capitalize bg-gradient-to-r from-[#0d9488]/10 to-teal-50 border-[#0d9488]/20 text-[#0d9488] shadow-sm font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {userRole.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 1: KPI STATS ROW
        ════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
              <BarChart3 className="h-4 w-4 text-[#0d9488]" />
            </div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Key Performance Indicators</h2>
            <div className="flex-1 h-px bg-slate-200/80 ml-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Students — admin sees all, teacher sees their class */}
            {isAdmin && (
              <StatCard
                title="Total Students"
                value={totalStudents}
                icon={Users}
                color={COLORS.teal}
                subtitle={`${activeStudents} active · ${alumniStudents} alumni`}
                loading={studentsQuery.isLoading}
              />
            )}
            {isTeacher && (
              <StatCard
                title="My Students"
                value={teacherClassStudentCount}
                icon={Users}
                color={COLORS.teal}
                subtitle={`Class ${teacherClassName}`}
                loading={teacherStudentsQuery.isLoading}
              />
            )}

            {/* Teachers — admin only */}
            {isAdmin && (
              <StatCard
                title="Faculty"
                value={totalTeachers}
                icon={GraduationCap}
                color={COLORS.blue}
                subtitle={`${activeTeachers} active`}
                loading={teachersQuery.isLoading}
              />
            )}

            {/* Attendance */}
            {(isAdmin || isTeacher) && (
              <StatCard
                title="Today's Attendance"
                value={totalAttendance > 0 ? `${attendancePercent}%` : "—"}
                icon={ClipboardCheck}
                color={attendancePercent >= 75 ? COLORS.green : attendancePercent >= 50 ? COLORS.amber : COLORS.rose}
                trend={attendancePercent >= 75 ? "up" : attendancePercent > 0 ? "down" : undefined}
                trendLabel={
                  totalAttendance > 0
                    ? `${presentCount} present · ${absentCount} absent`
                    : "No data yet"
                }
                loading={attendanceQuery.isLoading}
              />
            )}

            {/* Enrollments */}
            {isAdmin && (
              <StatCard
                title="Enrollments"
                value={totalEnrollments}
                icon={BookOpen}
                color={COLORS.purple}
                subtitle="Current session"
                loading={enrollmentQuery.isLoading}
              />
            )}

            {/* Classes */}
            {isAdmin && (
              <StatCard
                title="Classes"
                value={studentsByClass.length}
                icon={Building2}
                color={COLORS.orange}
                subtitle={`${enrollmentChartData.length} with enrollment`}
              />
            )}

            {/* Total Fees */}
            {isAdmin && (
              <StatCard
                title="Total Fees"
                value={`₹${(feeStats.totalFees / 100000).toFixed(1)}L`}
                icon={IndianRupee}
                color={COLORS.green}
                subtitle="Session total"
                loading={feeDashboardQuery.isLoading}
              />
            )}

            {/* Today's Collection */}
            {isAdmin && (
              <StatCard
                title="Today's Collection"
                value={`₹${feeStats.todayCollection.toLocaleString()}`}
                icon={IndianRupee}
                color={COLORS.teal}
                subtitle={format(new Date(), "MMM dd, yyyy")}
                loading={feeDashboardQuery.isLoading}
              />
            )}

            {/* Due Fees */}
            {isAdmin && (
              <StatCard
                title="Due Fees"
                value={`₹${(feeStats.dueFees / 100000).toFixed(1)}L`}
                icon={IndianRupee}
                color={COLORS.rose}
                subtitle="Outstanding amount"
                loading={feeDashboardQuery.isLoading}
              />
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 2: CHARTS ROW
        ════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
              <BarChart3 className="h-4 w-4 text-[#0d9488]" />
            </div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Analytics & Insights</h2>
            <div className="flex-1 h-px bg-slate-200/80 ml-2" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enrollment Bar Chart — admin only */}
            {isAdmin && enrollmentChartData.length > 0 && (
              <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
                      <BookOpen className="h-4 w-4 text-[#0d9488]" />
                    </div>
                    Class-wise Enrollment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Students",
                        color: COLORS.teal,
                      },
                    }}
                    className="w-full"
                    initialDimension={{ width: 320, height: 280 }}
                  >
                    <BarChart data={enrollmentChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.9}/>
                          <stop offset="95%" stopColor={COLORS.tealLight} stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(13, 148, 136, 0.05)" }}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="count"
                        fill="url(#colorEnrollment)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Weekly Attendance Trend */}
            {(isAdmin || isTeacher) && weeklyAttendanceData.length > 0 && (
              <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
                      <ClipboardCheck className="h-4 w-4 text-[#0d9488]" />
                    </div>
                    Weekly Attendance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer
                    config={{
                      present: {
                        label: "Present",
                        color: COLORS.green,
                      },
                      absent: {
                        label: "Absent",
                        color: COLORS.rose,
                      },
                    }}
                    className="w-full"
                    initialDimension={{ width: 320, height: 280 }}
                  >
                    <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(13, 148, 136, 0.05)" }}
                        content={<ChartTooltipContent />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        type="monotone"
                        dataKey="present"
                        stroke={COLORS.green}
                        strokeWidth={2.5}
                        fill="url(#colorPresent)"
                        name="Present"
                      />
                      <Area
                        type="monotone"
                        dataKey="absent"
                        stroke={COLORS.rose}
                        strokeWidth={2.5}
                        fill="url(#colorAbsent)"
                        name="Absent"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Gender Pie Chart */}
            {genderData.some((d) => d.value > 0) && (
              <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-slate-50/50 to-transparent">
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
                      <Users className="h-4 w-4 text-[#0d9488]" />
                    </div>
                    {isAdmin ? "Student Gender Ratio" : "Class Gender Ratio"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative">
                    <ChartContainer
                      config={{
                        boys: { label: "Boys", color: COLORS.blue },
                        girls: { label: "Girls", color: COLORS.rose },
                        male: { label: "Male", color: COLORS.blue },
                        female: { label: "Female", color: COLORS.rose },
                      }}
                      className="w-full"
                      initialDimension={{ width: 320, height: 220 }}
                    >
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-2xl font-extrabold text-slate-800">{genderData.reduce((sum, d) => sum + d.value, 0)}</p>
                      <p className="text-xs text-slate-500 font-medium">Total</p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-2 text-sm">
                    {genderData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-600 font-medium">
                          {d.name}: <strong className="text-slate-800">{d.value}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 3: ACTIVITY FEED
        ════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
              <Sparkles className="h-4 w-4 text-[#0d9488]" />
            </div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Activity</h2>
            <div className="flex-1 h-px bg-slate-200/80 ml-2" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
                    <Calendar className="h-4 w-4 text-[#0d9488]" />
                  </div>
                  Upcoming Events
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-[#0d9488]/5 text-[#0d9488] border-[#0d9488]/20 font-semibold">
                  Next 7 days
                </Badge>
              </CardHeader>
              <CardContent className="p-5">
                {eventsQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No upcoming events</p>
                    <p className="text-xs mt-1">Check back later for new events.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event, idx) => (
                      <div key={event.eventid} className="flex items-start gap-4 group">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold shrink-0 shadow-md ring-2 ring-white"
                            style={{ backgroundColor: event.color || COLORS.teal }}
                          >
                            <span className="text-[9px] opacity-90 leading-none uppercase">
                              {format(new Date(event.eventdate), "MMM")}
                            </span>
                            <span className="text-sm leading-none mt-0.5">
                              {new Date(event.eventdate).getDate()}
                            </span>
                          </div>
                          {idx < upcomingEvents.length - 1 && <div className="w-px h-full bg-slate-200 mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[#0d9488] transition-colors">
                            {event.eventname}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.eventdate), "EEEE, MMM dd")}
                          </p>
                          {event.venue && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" />
                              {event.venue}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Notices */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100">
                    <Megaphone className="h-4 w-4 text-amber-600" />
                  </div>
                  Recent Notices
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 font-semibold">
                  Latest
                </Badge>
              </CardHeader>
              <CardContent className="p-5">
                {noticesQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : recentNotices.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No notices yet</p>
                    <p className="text-xs mt-1">New announcements will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentNotices.map((notice) => (
                      <div
                        key={notice.id}
                        className="p-4 rounded-xl bg-slate-50/50 hover:bg-white transition-all border border-slate-100 hover:border-slate-200 hover:shadow-md group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-10 rounded-full bg-amber-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 capitalize font-bold bg-amber-50 text-amber-700 border-amber-200"
                              >
                                {notice.tag}
                              </Badge>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                {format(new Date(notice.data), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[#0d9488] transition-colors">
                              {notice.title}
                            </p>
                            {notice.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                {notice.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 4: QUICK STATS BOTTOM ROW
        ════════════════════════════════════════════════════════════ */}
        {isAdmin && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
                <BarChart3 className="h-4 w-4 text-[#0d9488]" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Quick Overview</h2>
              <div className="flex-1 h-px bg-slate-200/80 ml-2" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="relative bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#0d9488]/5 rounded-bl-[40px] group-hover:bg-[#0d9488]/10 transition-colors" />
                <p className="text-2xl font-extrabold text-[#0d9488]">{activeStudents}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Active Students</p>
                <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0d9488] to-teal-400 transition-all duration-500" style={{ width: `${totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="relative bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#3b82f6]/5 rounded-bl-[40px] group-hover:bg-[#3b82f6]/10 transition-colors" />
                <p className="text-2xl font-extrabold text-[#3b82f6]">{activeTeachers}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Active Teachers</p>
                <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-blue-400 transition-all duration-500" style={{ width: `${totalTeachers > 0 ? (activeTeachers / totalTeachers) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="relative bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#f59e0b]/5 rounded-bl-[40px] group-hover:bg-[#f59e0b]/10 transition-colors" />
                <p className="text-2xl font-extrabold text-[#f59e0b]">{studentsByClass.length}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Total Classes</p>
              </div>
              <div className="relative bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#8b5cf6]/5 rounded-bl-[40px] group-hover:bg-[#8b5cf6]/10 transition-colors" />
                <p className="text-2xl font-extrabold text-[#8b5cf6]">
                  {totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Retention</p>
              </div>
              <div className="relative bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#f97316]/5 rounded-bl-[40px] group-hover:bg-[#f97316]/10 transition-colors" />
                <p className="text-2xl font-extrabold text-[#f97316]">{alumniStudents}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Alumni</p>
              </div>
              <div className="relative bg-white border border-slate-200/60 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#0d9488]/5 rounded-bl-[40px] group-hover:bg-[#0d9488]/10 transition-colors" />
                <p className="text-2xl font-extrabold text-[#0d9488]">{totalEnrollments}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">This Session</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
