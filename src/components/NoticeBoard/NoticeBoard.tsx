import { useState, useMemo } from "react";
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

const categoryColors: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 border-slate-200",
  exam: "bg-red-100 text-red-700 border-red-200",
  holiday: "bg-green-100 text-green-700 border-green-200",
  meeting: "bg-purple-100 text-purple-700 border-purple-200",
  sports: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function NoticeBoard() {
  const queryClient = useQueryClient();
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const userRole = useAppSelector((s) => s.auth.user?.role ?? "");
  const canAddNotice = userRole.toLowerCase() === "admin";

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

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Megaphone className="h-6 w-6" />
              </span>
              Notice Board
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Stay updated with the latest announcements and notices.
            </p>
          </div>
          {canAddNotice && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              {showForm ? (
                <><X className="h-4 w-4 mr-2" />Cancel</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" />Add Notice</>
              )}
            </Button>
          )}
        </div>

        {/* Add Notice Form (admin only) */}
        {canAddNotice && showForm && (
          <Card className="border-amber-200 shadow-sm mb-6">
            <CardHeader className="border-b border-amber-100 pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-600" />
                New Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                <div>
                  <Label className="mb-1.5 block">
                    Notice Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Annual Sports Day Announcement"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Write the notice details..."
                    rows={4}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Date</Label>
                    <DatePickerSimple
                      DateTitle="Select date"
                      date={form.date}
                      setDate={(d) => setForm((p) => ({ ...p, date: d || new Date() }))}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Tag</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm((p) => ({ ...p, category: v as Notice["category"] }))}
                    >
                      <SelectTrigger>
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
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNotice}
                    disabled={!form.title.trim() || !form.content.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Notice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "general", "exam", "holiday", "meeting", "sports"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    filterCategory === cat
                      ? "bg-[#0d9488] text-white border-[#0d9488]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20 text-red-400">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Failed to load notices</p>
            <p className="text-sm mt-1">Please try again later.</p>
          </div>
        )}

        {/* Notices List */}
        {!isLoading && !isError && (
          <div className="space-y-4">
            {filteredNotices.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No notices found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter.</p>
              </div>
            ) : (
              filteredNotices.map((notice) => (
                <Card
                  key={notice.id}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 ${
                              categoryColors[notice.category]
                            }`}
                          >
                            {notice.category.charAt(0).toUpperCase() +
                              notice.category.slice(1)}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-semibold text-slate-900">
                          {notice.title}
                        </h3>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(notice.date)}
                          </span>
                        </div>

                        {/* Content */}
                        <p
                          className={`text-sm text-slate-600 mt-3 ${
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
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1.5 flex items-center gap-1"
                          >
                            {expandedId === notice.id ? (
                              <>
                                Show less <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                Read more <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
