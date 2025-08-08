export type ReservationStatus = "Pending" | "Confirmed" | "Cancelled";

export interface Reservation {
  villaId: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestsCount: number;
  startDate: string;       // ISO string (e.g., "2025-08-05T00:00:00Z")
  endDate: string;

  // optional if you include villa info from .Include()
  villa?: {
    id: number;
    name: string;
    region: string;
    description: string;
    pricePerNight: number;
    imageUrlsJson: string;
  };
}
// types/Reservation.ts (add this)
export interface ReservationResponseDTO{
  reservationCode: string;
  feeAmount: number;
}