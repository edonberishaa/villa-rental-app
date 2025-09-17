using api.Data;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/villas/{villaId:int}/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetReviews(int villaId)
        {
            var reviews = await _context.Reviews.Where(r => r.VillaId == villaId)
                .OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(reviews);
        }

        public record CreateDto(int Rating, string? Comment, string AuthorEmail);
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview(int villaId, [FromBody] CreateDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5) return BadRequest("Rating must be 1-5");
            var exists = await _context.Villas.AnyAsync(v => v.Id == villaId);
            if (!exists) return NotFound();
            var review = new Review { VillaId = villaId, Rating = dto.Rating, Comment = dto.Comment, AuthorEmail = dto.AuthorEmail };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }

        // Advanced review creation with photo upload
        [Authorize]
        [HttpPost("with-photos")]
        public async Task<IActionResult> CreateReviewWithPhotos(int villaId)
        {
            var form = await Request.ReadFormAsync();
            var ratingStr = form["Rating"].FirstOrDefault();
            var comment = form["Comment"].FirstOrDefault();
            var authorEmail = form["AuthorEmail"].FirstOrDefault();
            if (!int.TryParse(ratingStr, out int rating) || rating < 1 || rating > 5)
                return BadRequest("Rating must be 1-5");
            var exists = await _context.Villas.AnyAsync(v => v.Id == villaId);
            if (!exists) return NotFound();

            var photoUrls = new List<string>();
            var files = form.Files;
            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var ext = Path.GetExtension(file.FileName).ToLower();
                    if (ext != ".jpg" && ext != ".jpeg" && ext != ".png") continue;
                    var fileName = $"review_{Guid.NewGuid()}{ext}";
                    var savePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "reviews", fileName);
                    Directory.CreateDirectory(Path.GetDirectoryName(savePath)!);
                    using (var stream = new FileStream(savePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    var url = $"/images/reviews/{fileName}";
                    photoUrls.Add(url);
                }
            }

            var review = new Review
            {
                VillaId = villaId,
                Rating = rating,
                Comment = comment,
                AuthorEmail = authorEmail ?? User?.Identity?.Name ?? "",
                PhotoUrls = photoUrls
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }
    }
}


