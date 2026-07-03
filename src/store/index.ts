import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import studentReducer from "./slices/studentSlice";
import teacherReducer from "./slices/teacherSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    student: studentReducer,
    teacher: teacherReducer,
  },
});

export interface RootState {
  auth: ReturnType<typeof authReducer>;
  ui: ReturnType<typeof uiReducer>;
  student: ReturnType<typeof studentReducer>;
  teacher: ReturnType<typeof teacherReducer>;
}
export type AppDispatch = typeof store.dispatch;
