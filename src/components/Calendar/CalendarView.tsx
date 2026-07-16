import { useState } from "react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  type: "event" | "holiday" | "exam" | "meeting";
  color?: string;
}

const sampleEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Staff Meeting",
    date: new Date(2026, 6, 14),
    time: "10:00 AM",
    location: "Conference Room",
    type: "meeting",
  },
  {
    id: 2,
    title: "Mathematics Exam",
    date: new Date(2026, 6, 16),
    time: "9:00 AM",
    location: "Hall A",
    type: "exam",
  },
  {
    id: 3,
    title: "Summer Break",
    date: new Date(2026, 6, 20),
    type: "holiday",
  },
  {
    id: 4,
    title: "Science Fair",
    date: new Date(2026, 6, 25),
    time: "11:00 AM",
    location: "School Ground",
    type: "event",
  },
  {
    id: 5,
    title: "PTA Meeting",
    date: new Date(2026, 6, 28),
    time: "2:00 PM",
    location: "Auditorium",
    type: "meeting",
  },
];

export default function CalendarView() {
  const [date, setDate] = useState<Value>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [form, setForm] = useState({
    title: "",
    date: undefined as Date | undefined,
    venue: "",
    time: "",
    color: "#3b82f6",
  });

  const handleFormChange = (field: string, value: string | Date | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEvent = () => {
    if (!form.title || !form.date) return;
    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: form.title,
      date: form.date,
      time: form.time || undefined,
      location: form.venue || undefined,
      type: "event",
      color: form.color,
    };
    setEvents((prev) => [...prev, newEvent]);
    setForm({ title: "", date: undefined, venue: "", time: "", color: "#3b82f6" });
    setShowAddModal(false);
  };

  // Get events for a specific day (for tile content)
  const getDayEvents = (day: Date) => {
    return events.filter((e) => e.date.toDateString() === day.toDateString());
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-teal-50/30 to-[#0d9488]/10 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-[#0d9488] to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <span className="p-2.5 bg-linear-to-br from-[#0d9488] to-teal-600 text-white rounded-2xl shadow-lg shadow-[#0d9488]/30">
                <CalendarIcon className="h-7 w-7" />
              </span>
              Academic Calendar
            </h1>
            <p className="text-sm text-slate-600 mt-2 ml-14">
              View and manage school events, exams, and holidays.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-linear-to-r from-[#0d9488] to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white shadow-lg shadow-[#0d9488]/30 rounded-xl px-5 py-2.5 font-medium transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Calendar - Full Width */}
          <div className="w-full">
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <style>{`
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
                    gap: 0.5rem;
                  }
                  .react-calendar__navigation button {
                    min-width: 44px;
                    background: none;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1e293b;
                    border-radius: 12px;
                    padding: 10px 14px;
                    transition: all 0.2s ease;
                  }
                  .react-calendar__navigation button:enabled:hover,
                  .react-calendar__navigation button:enabled:focus {
                    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
                    transform: translateY(-1px);
                  }
                  .react-calendar__navigation button[disabled] {
                    opacity: 0.3;
                  }
                  .react-calendar__navigation__label {
                    font-size: 1.25rem !important;
                    font-weight: 800 !important;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                  }
                  .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: 700;
                    font-size: 0.75rem;
                    color: #64748b;
                    padding: 0.75rem 0;
                    letter-spacing: 0.05em;
                  }
                  .react-calendar__month-view__weekdays__weekday {
                    padding: 0.75rem 0;
                  }
                  .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none;
                    cursor: default;
                  }
                  .react-calendar__tile {
                    text-align: center;
                    padding: 14px 8px;
                    background: none;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #334155;
                    transition: all 0.2s ease;
                    position: relative;
                    margin: 2px;
                    min-height: 100px;
                    vertical-align: top;
                  }
                  .react-calendar__tile:enabled:hover,
                  .react-calendar__tile:enabled:focus {
                    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
                    color: #4f46e5;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
                  }
                  .react-calendar__tile--now {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
                    color: #d97706 !important;
                    font-weight: 700 !important;
                    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
                  }
                  .react-calendar__tile--now:enabled:hover,
                  .react-calendar__tile--now:enabled:focus {
                    background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%) !important;
                  }
                  .react-calendar__tile--active {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
                    color: white !important;
                    font-weight: 700 !important;
                    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
                    transform: translateY(-2px);
                  }
                  .react-calendar__tile--active:enabled:hover,
                  .react-calendar__tile--active:enabled:focus {
                    background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%) !important;
                  }
                  .react-calendar__tile--hasActive {
                    background: #eef2ff;
                  }
                  .react-calendar__month-view__days__day--weekend {
                    color: #ef4444;
                  }
                  .react-calendar__month-view__days__day--neighboringMonth {
                    color: #cbd5e1;
                  }
                  .event-dot {
                    display: flex;
                    justify-content: center;
                    gap: 4px;
                    margin-top: 6px;
                  }
                  .event-dot span {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    display: inline-block;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                  .event-dot span.blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
                  .event-dot span.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
                  .event-dot span.red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
                  .event-dot span.purple { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); }
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
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[9px] px-1 py-0.5 rounded truncate font-medium"
                            style={{
                              backgroundColor: ev.color || "#3b82f6",
                              color: "white",
                            }}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-slate-500 font-medium px-1">
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

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 border-0 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between bg-linear-to-r from-teal-50 to-teal-50/50">
                <CardTitle className="text-lg font-bold bg-linear-to-r from-[#0d9488] to-teal-600 bg-clip-text text-transparent">
                  Add Event
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/50"
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
                    className="rounded-xl border-slate-200 focus:border-[#0d9488] focus:ring-[#0d9488]/20 h-11"
                  />
                </div>

                {/* Event Date & Time - shadcn/ui modern pattern */}
                <FieldGroup className="flex-row gap-4">
                  <Field>
                    <FieldLabel htmlFor="event-date" className="text-sm font-semibold text-slate-700">
                      Event Date <span className="text-rose-500">*</span>
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="event-date"
                          className="w-full justify-between font-normal rounded-xl border-slate-200 h-11"
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
                  </Field>
                  <Field className="w-32">
                    <FieldLabel htmlFor="event-time" className="text-sm font-semibold text-slate-700">
                      Time
                    </FieldLabel>
                    <Input
                      type="time"
                      id="event-time"
                      step="1"
                      value={form.time}
                      onChange={(e) => handleFormChange("time", e.target.value)}
                      className="rounded-xl border-slate-200 focus:border-[#0d9488] focus:ring-[#0d9488]/20 h-11 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </Field>
                </FieldGroup>

                {/* Event Venue */}
                <div className="space-y-2">
                  <Label htmlFor="event-venue" className="text-sm font-semibold text-slate-700">
                    Event Venue
                  </Label>
                  <Input
                    id="event-venue"
                    placeholder="Enter venue (e.g., Conference Room)"
                    value={form.venue}
                    onChange={(e) => handleFormChange("venue", e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-[#0d9488] focus:ring-[#0d9488]/20 h-11"
                  />
                </div>

                {/* Event Color */}
                <div className="space-y-2">
                  <Label htmlFor="event-color" className="text-sm font-semibold text-slate-700">
                    Event Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="event-color"
                      value={form.color}
                      onChange={(e) => handleFormChange("color", e.target.value)}
                      className="w-12 h-11 rounded-xl border border-slate-200 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={form.color}
                      onChange={(e) => handleFormChange("color", e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1 rounded-xl border-slate-200 focus:border-[#0d9488] focus:ring-[#0d9488]/20 h-11"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEvent}
                    disabled={!form.title || !form.date}
                    className="flex-1 rounded-xl h-11 bg-linear-to-r from-[#0d9488] to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white shadow-lg shadow-[#0d9488]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
