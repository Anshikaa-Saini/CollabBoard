import axiosInstance from "./axiosInstance";

export const createRoomApi = (payload) => axiosInstance.post("/rooms", payload);

export const joinRoomApi = (payload) => axiosInstance.post("/rooms/join", payload);

export const getMyRoomsApi = () => axiosInstance.get("/rooms");

export const getRoomByIdApi = (id) => axiosInstance.get(`/rooms/${id}`);

export const renameRoomApi = (id, name) => axiosInstance.patch(`/rooms/${id}`, { name });

export const deleteRoomApi = (id) => axiosInstance.delete(`/rooms/${id}`);
