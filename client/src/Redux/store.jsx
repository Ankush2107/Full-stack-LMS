import { configureStore } from "@reduxjs/toolkit";

import LectureSliceReducer from "./Slice/LectureSlice";
import authSliceReducer from './Slices/AuthSlice';
import courseSliceReducer from './Slices/CourseSlice'
import razorpaySliceReducer from './Slices/RazorPaySlice'

const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        course: courseSliceReducer,
        razorpay: razorpaySliceReducer,
        lecture: LectureSliceReducer
    },
    devTools: true
});

export default store;                