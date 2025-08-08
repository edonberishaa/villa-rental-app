import axios from "axios";
import type { Reservation } from "../types/Reservation";
import type { ReservationResponseDTO } from "../types/Reservation";

const API_URL = "https://localhost:7021/api/reservation";

export const getReservations = async (): Promise<Reservation[]> => {
    const response = await axios.get<Reservation[]>(API_URL);
    return response.data;
}

export const createReservation = async (reservation: Reservation): Promise<ReservationResponseDTO> => {
  const response = await axios.post(API_URL, reservation);
  return response.data};