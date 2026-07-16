import { useState } from "react";
import {
  Bell,
  Pin,
  Calendar,
  User,
  Paperclip,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Plus,
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

interface Notice {
  id: number;
  title: string;
  content: string;
  date: Date;
  author: string;
  pinned: boolean;
  category: "general" | "exam" | "holiday" | "meeting" | "sports";
  attachments?: string[];
}

const sampleNotices: Notice[] = [
  {
    id: 1,
    title: "Annual Sports Day - Save the Date!",
    content:
      "The Annual Sports Day will be held on 15th August 2026. All students are requested to participate actively. Parents are cordially invited to attend the event. Please submit your participation forms by 5th August.",
    date: new Date(2026, 6, 13),
    author: "Principal",
    pinned: true,
    category: "sports",
  },
  {
    id: 2,
    title: "Mid-Term Examination Schedule",
    content:
      "The mid-term examinations will commence from 1st September 2026. The detailed schedule has been uploaded. Students are advised to start their preparations early.",
    date: new Date(2026, 6, 12),
    author: "Academic Coordinator",
    pinned: true,
    category: "exam",
  },
  {
    id: 3,
    title: "Holiday on 15th August",
    content:
      "The school will remain closed on 15th August 2026 on account of Independence Day. Regular classes will resume on 16th August.",
    date: new Date(2026, 6, 11),
    author: "Administration",
    pinned: false,
    category: "holiday",
  },
  {
    id: 4,
    title: "PTA Meeting Rescheduled",
    content:
      "The Parent-Teacher Association meeting originally scheduled for 20th July has been rescheduled to 25th July 2026 at 2:00 PM in the school auditorium.",
    date: new Date(2026, 6, 10),
    author: "PTA Coordinator",
    pinned: false,
    category: "meeting",
  },
  {
    id: 5,
    title: "Science Exhibition Registration Open",
    content:
      "Registrations for the Annual Science Exhibition are now open. Interested students can register with their class teacher. Last date for registration is 31st July.",
    date: new Date(2026, 6, 9),
    author: "Science Department",
    pinned: false,
    category: "general",
  },
];

const categoryColors: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 border-slate-200",
  exam: "bg-red-100 text-red-700 border-red-200",
  holiday: "bg-green-100 text-green-700 border-green-200",
  meeting: "bg-purple-100 text-purple-700 border-purple-200",
  sports: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function NoticeBoard() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(sampleNotices);
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: new Date(),
    category: "general" as Notice["category"],
  });

  const handleAddNotice = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const newNotice: Notice = {
      id: Date.now(),
      title: form.title.trim(),
      content: form.content.trim(),
      date: form.date,
      author: "Administration",
      pinned: false,
      category: form.category,
    };
    setNotices((prev) => [newNotice, ...prev]);
    setForm({ title: "", content: "", date: new Date(), category: "general" });
    setShowForm(false);
  };

  const filteredNotices = notices
    .filter(
      (n) =>
        (filterCategory === "all" || n.category === filterCategory) &&
        (n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.date.getTime() - a.date.getTime();
    });

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
        </div>

        {/* Add Notice Form */}
        {showForm && (
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

        {/* Notices List */}
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
                className={`border-slate-200 shadow-sm hover:shadow-md transition-all ${
                  notice.pinned ? "ring-1 ring-amber-300 bg-amber-50/30" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {notice.pinned && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">
                            <Pin className="h-3 w-3 mr-0.5" />
                            Pinned
                          </Badge>
                        )}
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
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {notice.author}
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

                      {/* Attachments */}
                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                          {notice.attachments.map((att, i) => (
                            <span
                              key={i}
                              className="text-xs text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                            >
                              {att}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
