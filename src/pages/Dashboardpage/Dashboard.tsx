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
    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-slate-400">{subtitle}</p>
              )}
              {trend && trendLabel && (
                <div className="flex items-center gap-1 text-xs pt-1">
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-rose-500" />
                  )}
                  <span className={trend === "up" ? "text-green-600 font-medium" : "text-rose-600 font-medium"}>
                    {trendLabel}
                  </span>
                </div>
              )}
            </div>
            <div
              className="p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-teal-50/20 to-[#0d9488]/5 p-4 md:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-[#0d9488] to-teal-600 text-white rounded-2xl shadow-lg shadow-[#0d9488]/30">
              <School className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-[#0d9488] to-teal-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {currentSession
                  ? `${currentSession.sessionName} · ${format(new Date(), "MMMM yyyy")}`
                  : "School Management System"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm capitalize bg-white/50 backdrop-blur-sm border-slate-200"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#0d9488]" />
              {userRole.replace("_", " ")} Access
            </Badge>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 1: KPI STATS ROW
        ════════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[#0d9488]" />
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Key Performance Indicators</h2>
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
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[#0d9488]" />
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Analytics & Insights</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enrollment Bar Chart — admin only */}
            {isAdmin && enrollmentChartData.length > 0 && (
              <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#0d9488]" />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(13, 148, 136, 0.08)" }}
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--color-count)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                        label={{ position: "top", fontSize: 10, fill: "#64748b" }}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Weekly Attendance Trend */}
            {(isAdmin || isTeacher) && weeklyAttendanceData.length > 0 && (
              <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-[#0d9488]" />
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
                    <BarChart data={weeklyAttendanceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                        allowDecimals={false}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(13, 148, 136, 0.08)" }}
                        content={<ChartTooltipContent />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="present"
                        fill="var(--color-present)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={30}
                        name="Present"
                      />
                      <Bar
                        dataKey="absent"
                        fill="var(--color-absent)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={30}
                        name="Absent"
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Gender Pie Chart */}
            {genderData.some((d) => d.value > 0) && (
              <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#0d9488]" />
                    {isAdmin ? "Student Gender Ratio" : "Class Gender Ratio"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer
                    config={{
                      boys: {
                        label: "Boys",
                        color: COLORS.blue,
                      },
                      girls: {
                        label: "Girls",
                        color: COLORS.rose,
                      },
                      male: {
                        label: "Male",
                        color: COLORS.blue,
                      },
                      female: {
                        label: "Female",
                        color: COLORS.rose,
                      },
                    }}
                    className="w-full"
                    initialDimension={{ width: 320, height: 220 }}
                  >
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend
                        verticalAlign="bottom"
                        height={30}
                        content={<ChartLegendContent />}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex justify-center gap-6 mt-2 text-sm">
                    {genderData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-slate-600">
                          {d.name}: <strong>{d.value}</strong>
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
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[#0d9488]" />
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Recent Activity</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0d9488]" />
                  Upcoming Events
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-[#0d9488]/5 text-[#0d9488] border-[#0d9488]/20">
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
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.eventid}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all hover:translate-x-1"
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                          style={{ backgroundColor: event.color || COLORS.teal }}
                        >
                          <span className="text-[10px] opacity-80 leading-none">
                            {format(new Date(event.eventdate), "MMM")}
                          </span>
                          <span className="text-sm leading-none mt-0.5">
                            {new Date(event.eventdate).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {event.eventname}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.eventdate), "EEEE, MMM dd, yyyy")}
                            {event.venue ? ` · ${event.venue}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Notices */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-600" />
                  Recent Notices
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
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
                  <div className="space-y-2">
                    {recentNotices.map((notice) => (
                      <div
                        key={notice.id}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all hover:translate-x-1"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 capitalize font-medium"
                          >
                            {notice.tag}
                          </Badge>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(notice.data), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {notice.title}
                        </p>
                        {notice.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                            {notice.description}
                          </p>
                        )}
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
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-[#0d9488]" />
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Quick Overview</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <Card className="border-0 shadow bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#0d9488]">{activeStudents}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Active Students</p>
                  <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#0d9488]" style={{ width: `${totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#3b82f6]">{activeTeachers}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Active Teachers</p>
                  <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#3b82f6]" style={{ width: `${totalTeachers > 0 ? (activeTeachers / totalTeachers) * 100 : 0}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#f59e0b]">{studentsByClass.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Classes</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#8b5cf6]">
                    {totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Retention</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#f97316]">{alumniStudents}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Alumni</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow bg-white rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#0d9488]">{totalEnrollments}</p>
                  <p className="text-xs text-slate-500 mt-0.5">This Session</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
        </div>
    </div>
  );
}
