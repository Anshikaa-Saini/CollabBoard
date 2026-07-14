import axiosInstance from "./axiosInstance";

export const getStickyNotesApi = (roomId) => axiosInstance.get(`/rooms/${roomId}/sticky-notes`);

export const generateStickyNotesApi = (roomId, prompt) =>
  axiosInstance.post(`/rooms/${roomId}/sticky-notes/generate`, { prompt });

export const updateStickyNoteApi = (roomId, noteId, payload) =>
  axiosInstance.patch(`/rooms/${roomId}/sticky-notes/${noteId}`, payload);

export const deleteStickyNoteApi = (roomId, noteId) =>
  axiosInstance.delete(`/rooms/${roomId}/sticky-notes/${noteId}`);
