import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  studentForm: boolean;
  teacherForm: boolean;
  studentProfile: boolean;
  assignPeriod: boolean;
  classTeacherAssign: boolean;
}

interface UiState {
  sidebarOpen: boolean;
  modals: ModalState;
  selectedStudent: any | null;
  selectedStudentId: number | null;
  selectedTeacher: any | null;
  selectedTeacherId: number | null;
}

const initialState: UiState = {
  sidebarOpen: true,
  modals: {
    studentForm: false,
    teacherForm: false,
    studentProfile: false,
    assignPeriod: false,
    classTeacherAssign: false,
  },
  selectedStudent: null,
  selectedStudentId: null,
  selectedTeacher: null,
  selectedTeacherId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    openModal(state, action: PayloadAction<keyof ModalState>) {
      state.modals[action.payload] = true;
    },
    closeModal(state, action: PayloadAction<keyof ModalState>) {
      state.modals[action.payload] = false;
    },
    toggleModal(state, action: PayloadAction<keyof ModalState>) {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    setSelectedStudent(state, action: PayloadAction<any | null>) {
      state.selectedStudent = action.payload;
    },
    setSelectedStudentId(state, action: PayloadAction<number | null>) {
      state.selectedStudentId = action.payload;
    },
    setSelectedTeacher(state, action: PayloadAction<any | null>) {
      state.selectedTeacher = action.payload;
    },
    setSelectedTeacherId(state, action: PayloadAction<number | null>) {
      state.selectedTeacherId = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  toggleModal,
  setSelectedStudent,
  setSelectedStudentId,
  setSelectedTeacher,
  setSelectedTeacherId,
} = uiSlice.actions;
export type { ModalState };
export default uiSlice.reducer;
