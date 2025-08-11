using System.ComponentModel.DataAnnotations;

namespace api.Models
{
    public enum SubmissionStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class PropertySubmission
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string OwnerEmail { get; set; } = string.Empty;
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal PricePerNight { get; set; }
        public string ImageUrlsJson { get; set; } = "[]";
        public string AmenitiesJson { get; set; } = "[]";
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}


