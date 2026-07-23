import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  X,
  ChevronDownIcon,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { useAppSelector } from "@/store/hooks";
import { fetchEvents, saveEvent, type EventItem } from "@/api/event";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  location?: string;
  color?: string;
}

export default function CalendarView() {
  const queryClient = useQueryClient();
  const currentSession = useAppSelector((s) => s.session.currentSession);
  const userRole = useAppSelector((s) => s.auth.user?.role ?? "");
  const normalizedRole = userRole.replace(/^ROLE_/i, "").toLowerCase();
  const canAddEvent = ["admin", "super_admin"].includes(normalizedRole);

  const [date, setDate] = useState<Value>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: undefined as Date | undefined,
    venue: "",
    color: "#3b82f6",
  });

  // ── Fetch events from backend ──────────────────────────────────────
  const {
    data: apiEvents,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // ── Save event mutation ────────────────────────────────────────────
  const { mutate: addEvent } = useMutation({
    mutationFn: (payload: {
      eventname: string;
      eventdate: string;
      venue: string;
      color: string;
      sessionId: number;
    }) => saveEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setForm({ title: "", date: undefined, venue: "", color: "#3b82f6" });
      setShowAddModal(false);
    },
  });

  // ── Map backend items to UI events ─────────────────────────────────
  const events: CalendarEvent[] = useMemo(() => {
    if (!apiEvents) return [];
    return apiEvents.map((item: EventItem) => ({
      id: item.eventid,
      title: item.eventname,
      date: new Date(item.eventdate),
      location: item.venue || undefined,
      color: item.color || "#3b82f6",
    }));
  }, [apiEvents]);

  const handleFormChange = (field: string, value: string | Date | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEvent = () => {
    if (!form.title || !form.date) return;
    if (!currentSession?.sessionId) return;
    addEvent({
      eventname: form.title,
      eventdate: form.date.toISOString().split("T")[0],
      venue: form.venue,
      color: form.color,
      sessionId: currentSession.sessionId,
    });
  };

  // Get events for a specific day (for tile content)
  const getDayEvents = (day: Date) => {
    return events.filter((e) => e.date.toDateString() === day.toDateString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-4 md:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#0d9488] blur-2xl opacity-20 animate-pulse" />
              <div className="relative p-3 bg-gradient-to-br from-[#0d9488] to-teal-600 text-white rounded-2xl shadow-lg shadow-[#0d9488]/20">
                <CalendarIcon className="h-7 w-7" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Academic Calendar
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Manage school events, exams, and holidays
              </p>
            </div>
          </div>
          {canAddEvent && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-[#0d9488] to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white shadow-lg shadow-[#0d9488]/30 rounded-xl px-5 py-2.5 font-medium transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#0d9488]/40"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0d9488]" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20 text-red-400">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Failed to load events</p>
            <p className="text-sm mt-1">Please try again later.</p>
          </div>
        )}

        {/* Calendar */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-6">
            <div className="w-full">
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <style>{`
                    @keyframes modalFadeIn {
                      from { opacity: 0; transform: scale(0.95) translateY(10px); }
                      to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes backdropFadeIn {
                      from { opacity: 0; }
                      to { opacity: 1; }
                    }
                    .react-calendar {
                      width: 100%;
                      border: none;
                      font-family: inherit;
                      background: transparent;
                    }
                    .react-calendar__navigation {
                      display: flex;
                      align-items: center;
                      margin-bottom: 2rem;
                      background: linear-gradient(135deg, rgba(13, 148, 136, 0.04) 0%, rgba(20, 184, 166, 0.02) 100%);
                      padding: 12px;
                      border-radius: 16px;
                      border: 1px solid rgba(13, 148, 136, 0.1);
                    }
                    .react-calendar__navigation button {
                      min-width: 44px;
                      background: none;
                      font-size: 16px;
                      font-weight: 600;
                      color: #1e293b;
                      border-radius: 12px;
                      padding: 10px 14px;
                      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .react-calendar__navigation button:enabled:hover,
                    .react-calendar__navigation button:enabled:focus {
                      background: white;
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                      transform: translateY(-1px);
                      color: #0d9488;
                    }
                    .react-calendar__navigation button[disabled] {
                      opacity: 0.3;
                    }
                    .react-calendar__navigation__label {
                      flex: 1 1 auto !important;
                      text-align: center !important;
                      font-size: 1.25rem !important;
                      font-weight: 800 !important;
                      color: #0f766e !important;
                      -webkit-text-fill-color: #0f766e !important;
                      pointer-events: none;
                    }
                    .react-calendar__navigation__prev-button,
                    .react-calendar__navigation__next-button {
                      flex: 0 0 auto !important;
                    }
                    .react-calendar__month-view__weekdays {
                      text-align: center;
                      text-transform: uppercase;
                      font-weight: 700;
                      font-size: 0.75rem;
                      color: #94a3b8;
                      padding: 0.5rem 0;
                      letter-spacing: 0.05em;
                    }
                    .react-calendar__month-view__weekdays__weekday {
                      padding: 0.5rem 0;
                    }
                    .react-calendar__month-view__weekdays__weekday abbr {
                      text-decoration: none;
                      cursor: default;
                    }
                    .react-calendar__month-view__days {
                      border-collapse: separate;
                      border-spacing: 8px;
                    }
                    .react-calendar__tile {
                      text-align: left;
                      padding: 12px;
                      background: white;
                      border-radius: 16px;
                      font-size: 0.9rem;
                      font-weight: 600;
                      color: #334155;
                      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      position: relative;
                      min-height: 110px;
                      vertical-align: top;
                      border: 1px solid rgba(226, 232, 240, 0.8);
                      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
                    }
                    .react-calendar__tile:enabled:hover,
                    .react-calendar__tile:enabled:focus {
                      background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
                      color: #0d9488;
                      transform: translateY(-4px) scale(1.02);
                      box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.1), 0 4px 6px -2px rgba(13, 148, 136, 0.05);
                      border-color: rgba(13, 148, 136, 0.3);
                      z-index: 10;
                    }
                    .react-calendar__tile--now {
                      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
                      color: #d97706 !important;
                      font-weight: 700 !important;
                      box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.1), 0 2px 4px -1px rgba(217, 119, 6, 0.06);
                      border-color: rgba(217, 119, 6, 0.2) !important;
                    }
                    .react-calendar__tile--now:enabled:hover,
                    .react-calendar__tile--now:enabled:focus {
                      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
                    }
                    .react-calendar__tile--active {
                      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;
                      color: white !important;
                      font-weight: 700 !important;
                      box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.3), 0 4px 6px -2px rgba(13, 148, 136, 0.15);
                      transform: translateY(-4px) scale(1.02);
                      border-color: transparent !important;
                    }
                    .react-calendar__tile--active:enabled:hover,
                    .react-calendar__tile--active:enabled:focus {
                      background: linear-gradient(135deg, #0f766e 0%, #115e59 100%) !important;
                    }
                    .react-calendar__tile--hasActive {
                      background: rgba(13, 148, 136, 0.08);
                    }
                    .react-calendar__month-view__days__day--weekend {
                      color: #f43f5e;
                    }
                    .react-calendar__month-view__days__day--neighboringMonth {
                      color: #cbd5e1;
                      background: #f8fafc;
                      border-color: rgba(226, 232, 240, 0.4);
                    }
                  `}</style>

                <Calendar
                  onChange={setDate}
                  value={date}
                  prevLabel={<ChevronLeft className="h-5 w-5" />}
                  nextLabel={<ChevronRight className="h-5 w-5" />}
                  prev2Label={null}
                  next2Label={null}
                  tileContent={({ date: tileDate, view }) => {
                    if (view !== "month") return null;
                    const dayEvents = getDayEvents(tileDate);
                    if (dayEvents.length === 0) return null;
                    
                    return (
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[9px] px-1.5 py-0.5 rounded-md truncate font-semibold shadow-sm flex items-center gap-1"
                            style={{
                              backgroundColor: `${ev.color || "#3b82f6"}20`,
                              color: ev.color || "#3b82f6",
                              border: `1px solid ${ev.color || "#3b82f6"}30`,
                            }}
                            title={ev.title}
                          >
                            <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ev.color || "#3b82f6" }} />
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-slate-500 font-bold px-1.5">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'backdropFadeIn 0.2s ease-out' }}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
            <Card className="relative w-full max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden" style={{ animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between bg-gradient-to-r from-teal-50 to-white">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#0d9488]/10">
                    <Sparkles className="h-4 w-4 text-[#0d9488]" />
                  </div>
                  Add New Event
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="event-title" className="text-sm font-semibold text-slate-700">
                    Event Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="event-title"
                    placeholder="Enter event name"
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-[#0d9488] focus:ring-[#0d9488]/20 h-11 transition-all"
                  />
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label htmlFor="event-date" className="text-sm font-semibold text-slate-700">
                    Event Date <span className="text-rose-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="event-date"
                        className="w-full justify-between font-normal rounded-xl border-slate-200 h-11 transition-all hover:bg-slate-50"
                      >
                        {form.date ? format(form.date, "PPP") : "Select date"}
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0 rounded-xl" align="start">
                      <ShadcnCalendar
                        mode="single"
                        selected={form.date}
                        captionLayout="dropdown"
                        defaultMonth={form.date}
                        onSelect={(date) => {
                          handleFormChange("date", date);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Event Venue */}
                <div className="space-y-2">
                  <Label htmlFor="event-venue" className="text-sm font-semibold text-slate-700">
                    Event Venue
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="event-venue"
                      placeholder="Enter venue (e.g., Conference Room)"
                      value={form.venue}
                      onChange={(e) => handleFormChange("venue", e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 focus:border-[#0d9488] focus:ring-[#0d9488]/20 h-11 transition-all"
                    />
                  </div>
                </div>

                {/* Event Color */}
                <div className="space-y-2">
                  <Label htmlFor="event-color" className="text-sm font-semibold text-slate-700">
                    Event Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        id="event-color"
                        value={form.color}
                        onChange={(e) => handleFormChange("color", e.target.value)}
                        className="w-12 h-11 rounded-xl border border-slate-200 cursor-pointer appearance-none bg-transparent"
                      />
                      <div className="absolute inset-0 rounded-xl pointer-events-none border border-slate-200" />
                    </div>
                    <Input
                      type="text"
                      value={form.color}
                      onChange={(e) => handleFormChange("color", e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1 rounded-xl border-slate-200 focus:border-[#0d9488] focus:ring-[#0d9488]/20 h-11 transition-all"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEvent}
                    disabled={!form.title || !form.date}
                    className="flex-1 rounded-xl h-11 bg-gradient-to-r from-[#0d9488] to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white shadow-lg shadow-[#0d9488]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-[#0d9488]/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
