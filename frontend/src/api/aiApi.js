import axiosInstance from "./axiosInstance";

export const getLatestSummaryApi = (roomId) => axiosInstance.get(`/rooms/${roomId}/ai/summary`);

export const generateSummaryApi = (roomId) => axiosInstance.post(`/rooms/${roomId}/ai/summary`);
