import axiosInstance from "./axiosInstance";

export const registerApi = (payload) => axiosInstance.post("/auth/register", payload);

export const loginApi = (payload) => axiosInstance.post("/auth/login", payload);

export const getMeApi = () => axiosInstance.get("/auth/me");
