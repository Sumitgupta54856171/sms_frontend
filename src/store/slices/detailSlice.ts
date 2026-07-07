import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


export interface detail {
    enrollmentNumber: number;
    scholarNumber:number;
    studentName: string;
    classNumber: string;
}

const initialState: detail = {
    enrollmentNumber: 0,
    scholarNumber: 0,
    studentName: '',
    classNumber: ''
}

export const detailSlice = createSlice({
    name: 'detail',
    initialState,
    reducers: {
        setDetail: (state, action: PayloadAction<detail>) => {
            state.enrollmentNumber = action.payload.enrollmentNumber;
            state.scholarNumber = action.payload.scholarNumber;
            state.studentName = action.payload.studentName;
            state.classNumber = action.payload.classNumber;
        },
        clearDetail: (state) => {
            state.enrollmentNumber = 0;
            state.scholarNumber = 0;
            state.studentName = '';
            state.classNumber = '';
        }
    }
})

export const { setDetail, clearDetail } = detailSlice.actions;

export default detailSlice.reducer;