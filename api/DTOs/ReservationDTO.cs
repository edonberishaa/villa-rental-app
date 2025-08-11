namespace api.DTOs
{
    public class ReservationDTO
    {
        public string? Message { get; set; }
        public required string ReservationCode { get; set; }
        public decimal FeeAmount { get; set; }
    }
}
