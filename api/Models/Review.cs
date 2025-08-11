using System.ComponentModel.DataAnnotations;

namespace api.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }
        [Range(1,5)]
        public int Rating { get; set; }
        [MaxLength(2048)]
        public string? Comment { get; set; }
        [Required]
        public int VillaId { get; set; }
        public Villa Villa { get; set; } = null!;
        [Required]
        public string AuthorEmail { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}


