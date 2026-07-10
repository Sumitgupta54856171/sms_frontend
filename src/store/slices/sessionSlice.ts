import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSessions, switchSession, type SessionItem } from "@/api/academicsession";

interface SessionState {
  sessions: SessionItem[];
  currentSession: SessionItem | null;
  loading: boolean;
}

function getSavedSessionId(): number | null {
  const saved = localStorage.getItem("currentSessionId");
  return saved ? Number(saved) : null;
}

const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  loading: false,
};

export const loadSessions = createAsyncThunk("session/loadSessions", async () => {
  const data = await fetchSessions();
  return data;
});

export const changeSession = createAsyncThunk(
  "session/changeSession",
  async (sessionId: number) => {
    await switchSession(sessionId);
    return sessionId;
  }
); 
const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setCurrentSession(state, action) {
      state.currentSession = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
        // Restore saved session from localStorage, or auto-select first
        const savedId = getSavedSessionId();
        if (savedId) {
          const found = action.payload.find((s) => s.sessionId === savedId);
          if (found) {
            state.currentSession = found;
          } else if (action.payload.length > 0) {
            state.currentSession = action.payload[0];
          }
        } else if (!state.currentSession && action.payload.length > 0) {
          state.currentSession = action.payload[0];
        }
      })
      .addCase(loadSessions.rejected, (state) => {
        state.loading = false;
      })
      .addCase(changeSession.fulfilled, (state, action) => {
        const found = state.sessions.find((s) => s.sessionId === action.payload);
        if (found) {
          state.currentSession = found;
          localStorage.setItem("currentSessionId", String(action.payload));
        }
      });
  },
});

export const { setCurrentSession } = sessionSlice.actions;
export default sessionSlice.reducer;
