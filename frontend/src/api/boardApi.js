import axiosInstance from "./axiosInstance";

export const getBoardApi = (roomId) => axiosInstance.get(`/rooms/${roomId}/board`);

export const saveBoardApi = (roomId, snapshot) =>
  axiosInstance.post(`/rooms/${roomId}/board`, { snapshot });
