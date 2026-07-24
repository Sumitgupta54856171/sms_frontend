import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Calendar,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Plus,
  Loader2,
  FileText,
  GraduationCap,
  PartyPopper,
  Users,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePickerSimple from "@/components/DatePicker";
import { useAppSelector } from "@/store/hooks";
import { fetchNotices, saveNotice, type NoticeItem } from "@/api/notice";

interface Notice {
  id: number;
  title: string;
  content: string;
  date: Date;
  category: "general" | "exam" | "holiday" | "meeting" | "sports";
}

const TAG_MAP: Record<string, Notice["category"]> = {
  general: "general",
  exam: "exam",
  holiday: "holiday",
  meeting: "meeting",
  sports: "sports",
};

const categoryConfig: Record<
  Notice["category"],
  {
    label: string;
    badge: string;
    iconBg: string;
    iconColor: string;
    icon: React.ElementType;
  }
> = {
  general: {
    label: "General",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    icon: FileText,
  },
  exam: {
    label: "Exam",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    icon: GraduationCap,
  },
  holiday: {
    label: "Holiday",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: PartyPopper,
  },
  meeting: {
    label: "Meeting",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    icon: Users,
  },
  sports: {
    label: "Sports",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    icon: Trophy,
  },
};

const filterConfig: Record<string, { label: string; color: string }> = {
  all: { label: "All Notices", color: "bg-slate-900" },
  general: { label: "General", color: "bg-slate-600" },
  exam: { label: "Exam", color: "bg-rose-600" },
  holiday: { label: "Holiday", color: "bg-emerald-600" },
  meeting: { label: "Meeting", color: "bg-violet-600" },
  sports: { label: "Sports", color: "bg-amber-600" },
};

export default function NoticeBoard() {
  const queryClient = useQueryClient();
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const userRole = useAppSelector((s) => s.auth.user?.role ?? "");
  const normalizedRole = userRole.replace(/^ROLE_/i, "").toLowerCase();
  const canAddNotice = ["admin", "super_admin"].includes(normalizedRole);

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: new Date(),
    category: "general" as Notice["category"],
  });

  // ── Fetch notices from backend ──────────────────────────────────────
  const {
    data: apiNotices,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notices"],
    queryFn: fetchNotices,
  });

  // ── Save notice mutation ────────────────────────────────────────────
  const { mutate: addNotice } = useMutation({
    mutationFn: (payload: {
      title: string;
      description: string;
      tag: string;
      data: string;
      sessionId: number;
    }) => saveNotice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      setForm({ title: "", content: "", date: new Date(), category: "general" });
      setShowForm(false);
    },
  });

  // ── Map backend items to UI notices (newest first) ──────────────────
  const notices: Notice[] = useMemo(() => {
    if (!apiNotices) return [];
    return apiNotices
      .slice()
      .reverse()
      .map((item: NoticeItem) => ({
        id: item.id,
        title: item.title,
        content: item.description,
        date: new Date(item.data),
        category: TAG_MAP[item.tag] ?? "general",
      }));
  }, [apiNotices]);

  const handleAddNotice = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (!currentSession?.sessionId) {
      return;
    }
    addNotice({
      title: form.title.trim(),
      description: form.content.trim(),
      tag: form.category,
      data: form.date.toISOString().split("T")[0],
      sessionId: currentSession.sessionId,
    });
  };

  const filteredNotices = notices
    .filter(
      (n) =>
        (filterCategory === "all" || n.category === filterCategory) &&
        (n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isNewNotice = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-3 border border-amber-100">
                <Megaphone className="h-3.5 w-3.5" />
                Announcements
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Notice Board
              </h1>
              <p className="text-base text-slate-500 mt-2 leading-relaxed">
                Stay updated with the latest announcements, events, and important information.
              </p>
            </div>
            {canAddNotice && (
              <Button
                onClick={() => setShowForm(!showForm)}
                className={`shadow-md transition-all duration-200 ${
                  showForm
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-amber-600 hover:bg-amber-700 hover:shadow-lg hover:-translate-y-0.5 text-white"
                }`}
              >
                {showForm ? (
                  <><X className="h-4 w-4 mr-2" />Cancel</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" />Add Notice</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Add Notice Form (admin only) */}
        {canAddNotice && showForm && (
          <Card className="border-slate-200 shadow-lg mb-8 overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Megaphone className="h-4 w-4 text-amber-600" />
                </div>
                Create New Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700">
                    Notice Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Annual Sports Day Announcement"
                    className="h-11 border-slate-200 focus-visible:ring-amber-400 focus-visible:ring-offset-0"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Write the notice details..."
                    rows={4}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition-shadow"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-700">Date</Label>
                    <DatePickerSimple
                      DateTitle="Select date"
                      date={form.date}
                      setDate={(d) => setForm((p) => ({ ...p, date: d || new Date() }))}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-slate-700">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm((p) => ({ ...p, category: v as Notice["category"] }))}
                    >
                      <SelectTrigger className="h-11 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNotice}
                    disabled={!form.title.trim() || !form.content.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Publish Notice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notices by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white border-slate-200 focus-visible:ring-amber-400 focus-visible:ring-offset-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(filterConfig).map(([cat, config]) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                  filterCategory === cat
                    ? `${config.color} text-white border-transparent shadow-sm`
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600 mb-4" />
            <p className="text-sm font-medium text-slate-600">Loading notices...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl border border-red-100 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-slate-900">Failed to load notices</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't fetch the latest notices. Please check your connection and try again.
            </p>
          </div>
        )}

        {/* Notices List */}
        {!isLoading && !isError && (
          <div className="space-y-4">
            {filteredNotices.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-slate-900">No notices found</p>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  {search
                    ? "No notices match your search. Try different keywords or filters."
                    : "There are no notices in this category yet. Check back later."}
                </p>
              </div>
            ) : (
              filteredNotices.map((notice) => {
                const CategoryIcon = categoryConfig[notice.category].icon;
                return (
                  <Card
                    key={notice.id}
                    className="group border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 bg-white overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4 p-5 sm:p-6">
                        <div className={`hidden sm:flex shrink-0 w-12 h-12 rounded-xl items-center justify-center ${categoryConfig[notice.category].iconBg} ${categoryConfig[notice.category].iconColor}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Header row */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge
                              variant="outline"
                              className={`text-[11px] px-2.5 py-0.5 font-medium border ${categoryConfig[notice.category].badge}`}
                            >
                              {categoryConfig[notice.category].label}
                            </Badge>
                            {isNewNotice(notice.date) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                                New
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                            {notice.title}
                          </h3>

                          {/* Meta */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(notice.date)}
                            </span>
                          </div>

                          {/* Content */}
                          <p
                            className={`text-sm text-slate-600 mt-3 leading-relaxed ${
                              expandedId !== notice.id ? "line-clamp-2" : ""
                            }`}
                          >
                            {notice.content}
                          </p>

                          {/* Read more / less */}
                          {notice.content.length > 120 && (
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === notice.id ? null : notice.id
                                )
                              }
                              className="text-xs font-semibold text-amber-700 hover:text-amber-800 mt-3 inline-flex items-center gap-1 transition-colors"
                            >
                              {expandedId === notice.id ? (
                                <>
                                  Show less <ChevronUp className="h-3.5 w-3.5" />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
