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