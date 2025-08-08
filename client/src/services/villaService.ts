import api from "./api";
import type { Villa } from "../types/Villa";

export const getAllVillas = async (): Promise<Villa[]> => {
    const response = await api.get('/villas');
    return response.data;
}
export const getVillaById = async(id: number): Promise<Villa>=> {
    const response = await api.get(`/villas/${id}`);
    return response.data;
}

export const createVilla = async(villa: Villa): Promise<Villa> => {
    const response = await api.post('/villas', villa);
    return response.data;
}
export const updateVilla = async(id: number, villa: Villa): Promise<Villa> => {
    const response = await api.put(`/villas/${id}`, villa);
    return response.data;
}
export const deleteVilla = async(id: number): Promise<Villa> => {
    const response = await api.delete(`/villas/${id}`);
    return response.data;
}

export const getAllReservations = () => api.get('/reservation');
export const getReservationById = (id: any) => api.get(`/reservation/${id}`);
export const createReservation = (reservation: any) => api.post('/reservation', reservation);
export const confirmReservation = (id: any,data: any) =>
    api.put(`/reservation/confirm/${id}`, data);
export const endReservation = (id: any) => api.put(`/reservation/end/${id}`);
export const deleteReservation = (id: any) => api.delete(`/reservation/${id}`);