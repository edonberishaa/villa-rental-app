import type { Reservation } from "../types/Reservation";
import type { ReservationResponseDTO } from "../types/Reservation";
import api from "./api";

const BASE = "/reservation";

export const getReservations = async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>(BASE);
    return response.data;
}

export interface CreateReservationResponse extends ReservationResponseDTO {
  clientSecret?: string;
}

export const createReservation = async (reservation: Reservation): Promise<CreateReservationResponse> => {
  const response = await api.post(BASE, reservation);
  return response.data
};

export async function getReservedDatesForVilla(villaId: number) {
  const res = await api.get(`/reservation/villa/${villaId}/dates`);
  return res.data as { startDate: string; endDate: string }[];
}

export async function getReservationsForOwnedVilla(villaId: number) {
  const res = await api.get(`/owner/properties/${villaId}/reservations`);
  return res.data;
}