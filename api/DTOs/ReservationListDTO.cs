using api.Models;

namespace api.DTOs
{
    public class ReservationListDTO
    {
        public int Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public ReservationStatus Status { get; set; }
        public int VillaId { get; set; }
        public string VillaName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string GuestPhone { get; set; } = string.Empty;
        public string? GuestEmail { get; set; }
        public int GuestsCount { get; set; }
        public decimal ReservationFeeAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


