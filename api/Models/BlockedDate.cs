using System.ComponentModel.DataAnnotations;

namespace api.Models
{
    public class BlockedDate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VillaId { get; set; }
        public Villa Villa { get; set; } = null!;

        [Required]
        public DateTime StartDate { get; set; }  // inclusive

        [Required]
        public DateTime EndDate { get; set; }    // inclusive

        public string? Reason { get; set; }
    }
}
