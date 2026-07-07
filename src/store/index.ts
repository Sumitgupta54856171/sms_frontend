import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import studentReducer from "./slices/studentSlice";
import teacherReducer from "./slices/teacherSlice";
import detailReducer from "./slices/detailSlice";
import sessionReducer from "./slices/sessionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    student: studentReducer,
    teacher: teacherReducer,
    detail: detailReducer,
    session: sessionReducer,
  },
});

export interface RootState {
  auth: ReturnType<typeof authReducer>;
  ui: ReturnType<typeof uiReducer>;
  student: ReturnType<typeof studentReducer>;
  teacher: ReturnType<typeof teacherReducer>;
  detail: ReturnType<typeof detailReducer>;
  session: ReturnType<typeof sessionReducer>;
}
export type AppDispatch = typeof store.dispatch;
