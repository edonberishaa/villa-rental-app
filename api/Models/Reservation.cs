using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    public enum ReservationStatus
    {
        Pending,
        Confirmed,
        Cancelled,
        Completed
    }
    public class Reservation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VillaId { get; set; }
        public Villa Villa { get; set; } = null!;

        [Required]
        public string GuestName { get; set; } = null!;

        [Required]
        public string GuestPhone { get; set; } = null!;

        public string? GuestEmail { get; set; }

        public int GuestsCount { get; set; } = 1;

        [Required]
        public DateTime StartDate { get; set; } // inclusive

        [Required]
        public DateTime EndDate { get; set; } // inclusive

        [Column(TypeName = "decimal(10,2)")]
        public decimal ReservationFeeAmount { get; set; }

        [Required]
        [MaxLength(64)]
        public string ReservationCode { get; set; } = null!; // unique, e.g., GUID or custom

        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
