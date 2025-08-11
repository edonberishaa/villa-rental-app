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
    }
}


