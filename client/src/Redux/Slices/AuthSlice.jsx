import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

import axiosInstance from '../../Helpers/axiosInstance';

const initialState = {
    isLoggedIn: localStorage.getItem('isLoggedIn') || false,
    role: localStorage.getItem('role') || "",
    data: JSON.parse(localStorage.getItem('data')) || {}
};

export const createAccount = createAsyncThunk("/auth/signup", async (data) => {
    try {
        const response = axiosInstance.post("users/register", data);
        console.log(response);
        toast.promise(response, {
            loading: "Wait! creating your account",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to create account"
        });
        return (await response).data;
        // console.log(response);
        
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
            error: "Failed to log out"
        })
        return (await res).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const updateProfile = createAsyncThunk("/user/update/profile", async (data) => {
    try {
        const res = axiosInstance.put(`user/update/`, data);
        toast.promise(res, {
            loading: "Wait profile update in progress",
            success: (data) => {
                return data?.data?.message
            },
            error: "Failed to update profile"
        })
        return (await res).data;
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
});

export const getUserData = createAsyncThunk("/user/details/profile", async () => {
    try {
        const res = axiosInstance.get("user/me");
        return (await res).data;
    } catch (error) {
        toast.error(error.message)
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(login.fulfilled, (state, action) => {
            console.log("Action is ", action);
            localStorage.setItem("data", JSON.stringify(action?.payload?.user));

            localStorage.setItem("isLoggedIn", true);

            localStorage.setItem("role", action?.payload?.user?.role);

            state.isLoggedIn = true;

            state.data = action?.payload?.user;

            state.role = action?.payload?.user?.role;
        })
        .addCase(logout.fulfilled,(state)=>{
            localStorage.clear();
            state.data = {};
            state.isLoggedIn = false;
            state.role ="";
        })
        .addCase(getUserData.fulfilled, (state, action) => {
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