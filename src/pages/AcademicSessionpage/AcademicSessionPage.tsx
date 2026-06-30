import {useState} from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import DatePickerSimple from "@/components/DatePicker";
import { useMutation } from "@tanstack/react-query";
import { saveAcademicSession } from "@/api/academicsession";
import { toast } from "sonner";

export default function AcademicSessionPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sessionName, setSessionName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const mutation = useMutation({
    mutationFn: saveAcademicSession,
    onSuccess: () => {
      // Success toast is handled globally by the API client interceptor
      setSessionName("");
      setDescription("");
      setStartDate(undefined);
      setEndDate(undefined);
    },
    // Error toast is handled globally by the API client interceptor
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionName.trim()) {
      toast.error("Session name is required");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!endDate) {
      toast.error("End date is required");
      return;
    }

    mutation.mutate({
      session_name: sessionName.trim(),
      session_start_date: startDate.toISOString(),
      session_end_date: endDate.toISOString(),
      description: description.trim() || undefined,
      is_active: true,
      is_current: true,
    });
  };

  return (
    <div className="min-h-screen w-full flex font-sans">
      
      
      <div 
        className="hidden lg:flex w-1/2 bg-[#09090b] relative flex-col justify-between p-12 text-white overflow-hidden"
      >
        {/* Dotted Grid Background */}
        <div 
          className="absolute inset-0 z-0 opacity-30" 
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }}
        />

        {/* Top Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#6366f1] text-sm font-bold shadow-sm">
            V
          </div>
          <span className="font-semibold text-lg tracking-tight">Veridian</span>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 max-w-md pr-8">
          <h2 className="text-[28px] leading-[1.3] font-serif italic text-slate-100 mb-8">
            "The administrative weight of a school should never outweigh the teaching inside it."
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">Dr. Amara Whitfield</span>
              <span className="text-[13px] text-slate-400">Head of School, Lindenwood Academy</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-[11px] font-medium tracking-[0.15em] text-slate-500 uppercase">
          Est. Record-Keeping, Reimagined
        </div>
      </div>

      {/* --- RIGHT PANEL (LIGHT THEME / FORM) --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-[#fafafa] p-8 sm:p-12">
        
        <div className="w-full max-w-[380px] space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-[#2563eb]" />
              New Academic Session
            </h1>
            <p className="text-sm text-slate-500">Create and configure a new academic term for Lindenwood Academy.</p>
          </div>

          {/* Session Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div className="space-y-2">
              <Label htmlFor="sessionName" className="text-xs text-slate-600 font-medium">Session Name</Label>
              <Input 
                id="sessionName" 
                type="text" 
                placeholder="e.g. Fall Semester 2024" 
                className="h-11 bg-white border-slate-200 focus-visible:ring-slate-400 placeholder:text-slate-400"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs text-slate-600 font-medium">Start Date</Label>
                <DatePickerSimple DateTitle="Select Start Date" date={startDate} setDate={setStartDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs text-slate-600 font-medium">End Date</Label>
                <DatePickerSimple DateTitle="Select End Date" date={endDate} setDate={setEndDate} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs text-slate-600 font-medium">Description (Optional)</Label>
              <Input 
                id="description" 
                type="text" 
                placeholder="Brief description of the term" 
                className="h-11 bg-white border-slate-200 focus-visible:ring-slate-400 placeholder:text-slate-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-[#111827] hover:bg-black text-white mt-2 gap-2 text-sm font-medium transition-colors shadow-sm" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner className="size-5" /> : "Create Session"} <ArrowRight className="h-4 w-4" />
            </Button>

          </form>

          {/* Footer Text */}
          <p className="text-center text-[13px] text-slate-400 pt-4">
            Fill in the details to add a new academic year.
          </p>

        </div>
      </div>

    </div>
  );
}
