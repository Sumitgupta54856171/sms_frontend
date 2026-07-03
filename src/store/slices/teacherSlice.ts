import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { fetchTeachers, type TeacherResponse } from "@/api/teacher";

interface TeacherState {
  list: TeacherResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  list: [],
  loading: false,
  error: null,
};

export const loadTeachers = createAsyncThunk("teacher/loadTeachers", async () => {
  const data = await fetchTeachers();
  return data;
});

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setTeachers(state, action: PayloadAction<TeacherResponse[]>) {
      state.list = action.payload;
    },
    clearTeachers(state) {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(loadTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load teachers";
      });
  },
});

export const { setTeachers, clearTeachers } = teacherSlice.actions;
export default teacherSlice.reducer;
