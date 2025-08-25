using api.Data;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SubmissionsController(AppDbContext context) { _context = context; }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] PropertySubmission submission)
        {
            submission.Status = SubmissionStatus.Pending;
            _context.PropertySubmissions.Add(submission);
            await _context.SaveChangesAsync();
            return Ok(submission);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> List([FromQuery] SubmissionStatus? status)
        {
            var q = _context.PropertySubmissions.AsQueryable();
            if (status.HasValue) q = q.Where(s => s.Status == status.Value);
            var list = await q.OrderByDescending(s=>s.CreatedAt).ToListAsync();
            return Ok(list);
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(int id)
        {
            var s = await _context.PropertySubmissions.FindAsync(id);
            if (s == null) return NotFound();
            if (!s.Paid) return BadRequest("Listing fee not paid");
            s.Status = SubmissionStatus.Approved;
            // create villa from submission
            var villa = new Villa {
                Name = s.Name, Region = s.Region, Description = s.Description, PricePerNight = s.PricePerNight,
                ImageUrlsJson = s.ImageUrlsJson, AmenitiesJson = s.AmenitiesJson, Address = s.Address, Latitude = s.Latitude, Longitude = s.Longitude,
                OwnerEmail = s.OwnerEmail
            };
            _context.Villas.Add(villa);
            await _context.SaveChangesAsync();
            return Ok(villa);
        }

        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reject(int id)
        {
            var s = await _context.PropertySubmissions.FindAsync(id);
            if (s == null) return NotFound();
            s.Status = SubmissionStatus.Rejected;
            await _context.SaveChangesAsync();
            return Ok(s);
        }
        [HttpPost("{id}/images")]
        [Authorize]
        public async Task<IActionResult> UploadImages(int id, List<IFormFile> files)
        {
            var submission = await _context.PropertySubmissions.FindAsync(id);
            if (submission == null) return NotFound();
            if (files == null || files.Count == 0) return BadRequest("No files uploaded");

            var saveDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            if (!Directory.Exists(saveDir)) Directory.CreateDirectory(saveDir);
            var saved = new List<string>();
            foreach (var file in files)
            {
                var ext = Path.GetExtension(file.FileName);
                var fileName = $"submission_{id}_{Guid.NewGuid()}{ext}";
                var path = Path.Combine(saveDir, fileName);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                saved.Add($"/images/{fileName}");
            }
            // Update submission's ImageUrlsJson
            var urls = new List<string>();
            if (!string.IsNullOrWhiteSpace(submission.ImageUrlsJson))
            {
                try { urls = System.Text.Json.JsonSerializer.Deserialize<List<string>>(submission.ImageUrlsJson) ?? new List<string>(); } catch { }
            }
            urls.AddRange(saved);
            submission.ImageUrlsJson = System.Text.Json.JsonSerializer.Serialize(urls);
            await _context.SaveChangesAsync();
            return Ok(new { imageUrls = urls });
        }
    }
}


