import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

interface FeeState {
  totalFees: number;
  loading: boolean;
  error: string | null;
}