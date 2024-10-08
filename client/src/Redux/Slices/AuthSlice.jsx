import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

import axiosInstance from '../../Helpers/axiosInstance';

const initialState = {
    isLoggedIn: localStorage.getItem('isLoggedIn') || false,
    role: localStorage.getItem('role') || "",
    data: localStorage.getItem('data') || {}
};

export const createAccount = createAsyncThunk("/auth/signup", async (data) => {
    try {
        const response = axiosInstance.post("users/register", data);
        // console.log(res);
        // toast.promise(res, {
        //     loading: "Wait! creating your account",
        //     success: (data) => {
        //         return data?.data?.message;
        //     },
        //     error: "Failed to create account"
        // });
        // return res.data;
        console.log(response);
        
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});
export const login = createAsyncThunk("/auth/login", async (data) => {
    try {
        const res = axiosInstance.post("users/login", data);
        console.log(res);
        toast.promise(res, {
            loading: "Wait! authentication in progress...",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to log in"
        });
        const finalRes = (await res).data;
        console.log(finalRes);
        return finalRes;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const logout = createAsyncThunk("/auth/logout", async () => {
    try {
        const res = axiosInstance.get("user/logout");
        toast.promise(res, {
            loading: "Wait logout in progress",
            success: (data) => {
                return data?.data?.message
            },
            error: "Failed to logout"
        })
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
            console.log("Action is ", action);

            localStorage.setItem("data", JSON.stringify(action?.payload?.user));

            localStorage.setItem("isLoggedIn", true);

            localStorage.setItem("role", action?.payload?.user?.role);

            state.isLoggedIn = true;

            state.data = action?.payload?.user;

            state.role = action?.payload?.user?.role;
        })
    }
});

// export const {} = authSlice.actions;
export default authSlice.reducer;