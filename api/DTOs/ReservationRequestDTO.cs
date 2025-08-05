namespace api.DTOs
{
    public class ReservationRequestDTO
    {
        public int VillaId { get; set; }
        public string GuestName { get; set; } = null!;
        public string GuestPhone { get; set; } = null!;
        public string? GuestEmail { get; set; }
        public int GuestsCount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

}
