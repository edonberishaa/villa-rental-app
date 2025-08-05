using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Villa
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public string Region { get; set; } = null!;
    public string? Description { get; set; }
    [Column(TypeName = "decimal(10,2)")]
    public decimal PricePerNight { get; set; }
    public string ImageUrlsJson { get; set; } = "[]";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
}