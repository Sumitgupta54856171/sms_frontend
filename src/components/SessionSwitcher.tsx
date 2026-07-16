import { useEffect, useState, useRef } from "react";
import { Calendar, Check, ChevronDown, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadSessions, changeSession } from "@/store/slices/sessionSlice";

export default function SessionSwitcher() {
  const dispatch = useAppDispatch();
  const { sessions, currentSession, loading } = useAppSelector((s) => s.session);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  // Only fetch sessions once, not on every mount
  useEffect(() => {
    if (!fetchedRef.current && sessions.length === 0) {
      fetchedRef.current = true;
      dispatch(loadSessions());
    }
  }, [dispatch, sessions.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (sessionId: number) => {
    dispatch(changeSession(sessionId));
    setOpen(false);
  };

  const handleRefresh = () => {
    dispatch(loadSessions());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 font-medium">Active Session</p>
          <p className="text-[13px] font-semibold text-slate-800 truncate">
            {currentSession?.sessionName || "No session"}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mb-1 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Sessions ({sessions.length})
            </span>
            <button
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
              title="Refresh sessions"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Session List */}
          {sessions.length === 0 && !loading && (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              No sessions available
            </div>
          )}

          {loading && sessions.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              Loading sessions...
            </div>
          )}

          {sessions.map((session) => {
            const isActive = currentSession?.sessionId === session.sessionId;
            return (
              <button
                key={session.sessionId}
                onClick={() => handleSwitch(session.sessionId)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-teal-50 transition-colors ${
                  isActive ? "bg-teal-50 border-l-2 border-teal-600" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${isActive ? "text-teal-800" : "text-slate-700"}`}>
                    {session.sessionName}
                  </p>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-teal-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
