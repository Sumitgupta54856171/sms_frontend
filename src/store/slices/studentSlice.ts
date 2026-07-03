import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { fetchStudents, type StudentResponse } from "@/api/student";

interface StudentState {
  list: StudentResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  list: [],
  loading: false,
  error: null,
};

export const loadStudents = createAsyncThunk("student/loadStudents", async () => {
  const data = await fetchStudents();
  return data;
});

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudents(state, action: PayloadAction<StudentResponse[]>) {
      state.list = action.payload;
    },
    clearStudents(state) {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(loadStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load students";
      });
  },
});

export const { setStudents, clearStudents } = studentSlice.actions;
export default studentSlice.reducer;
