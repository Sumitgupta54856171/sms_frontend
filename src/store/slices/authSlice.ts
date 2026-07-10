import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "@/api/auth";

export interface AuthUser {
  token: string;
  role: string;
  name?: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initializing: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initializing: true,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const data = await loginUser({ email, password });
    const token = data.token ?? data.accessToken;
    const role = data.role ?? data.user?.role ?? "teacher";

    localStorage.setItem("token", token);
    localStorage.setItem("useRole", role);

    return { token, role, email };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("useRole");
      localStorage.removeItem("currentSessionId");
    },
    finishInitializing(state) {
      state.initializing = false;
    },
    restoreSession(state) {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("useRole");
      const name = localStorage.getItem("userName") || undefined;
      const email = localStorage.getItem("userEmail") || undefined;
      if (token && role) {
        state.user = { token, role, name, email };
      }
      state.initializing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout, finishInitializing, restoreSession } = authSlice.actions;
export default authSlice.reducer;
