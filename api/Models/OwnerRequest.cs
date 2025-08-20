using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    public class OwnerRequest
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public AppUser User { get; set; }
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public bool? Approved { get; set; } // null = pending, true = approved, false = refused
        public DateTime? RespondedAt { get; set; }
        public string? AdminId { get; set; }
    }
}
