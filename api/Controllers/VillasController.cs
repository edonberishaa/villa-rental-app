using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VillasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public VillasController(AppDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        // GET: api/Villas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Villa>>> GetVillas(
            [FromQuery] string? q,
            [FromQuery] string? region,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sort)
        {
            var query = _context.Villas.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var lower = q.ToLower();
                query = query.Where(v =>
                    v.Name.ToLower().Contains(lower) ||
                    v.Region.ToLower().Contains(lower) ||
                    (v.Description ?? string.Empty).ToLower().Contains(lower));
            }

            if (!string.IsNullOrWhiteSpace(region))
            {
                query = query.Where(v => v.Region == region);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(v => v.PricePerNight >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(v => v.PricePerNight <= maxPrice.Value);
            }

            switch (sort)
            {
                case "priceAsc":
                    query = query.OrderBy(v => v.PricePerNight);
                    break;
                case "priceDesc":
                    query = query.OrderByDescending(v => v.PricePerNight);
                    break;
                case "newest":
                    query = query.OrderByDescending(v => v.CreatedAt);
                    break;
            }

            return await query.ToListAsync();
        }

        // GET: api/Villas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Villa>> GetVilla(int id)
        {
            var villa = await _context.Villas.FindAsync(id);

            if (villa == null)
            {
                return NotFound();
            }

            return villa;
        }

        // PUT: api/Villas/5
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVilla(int id, Villa villa)
        {
            if (id != villa.Id)
            {
                return BadRequest();
            }

            _context.Entry(villa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VillaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(villa);
        }

        // POST: api/Villas
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Villa>> PostVilla(Villa villa)
        {
            _context.Villas.Add(villa);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVilla", new { id = villa.Id }, villa);
        }

        // DELETE: api/Villas/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVilla(int id)
        {
            var villa = await _context.Villas.FindAsync(id);
            if (villa == null)
            {
                return NotFound();
            }

            _context.Villas.Remove(villa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Image upload
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/images")]
        public async Task<IActionResult> UploadImages(int id, List<IFormFile> files)
        {
            var villa = await _context.Villas.FindAsync(id);
            if (villa == null) return NotFound();
            if (files == null || files.Count == 0) return BadRequest("No files");

            var saveDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
            Directory.CreateDirectory(saveDir);
            var saved = new List<string>();
            foreach (var file in files)
            {
                var fileName = $"villa_{id}_{Guid.NewGuid():N}{Path.GetExtension(file.FileName)}";
                var path = Path.Combine(saveDir, fileName);
                using var stream = new FileStream(path, FileMode.Create);
                await file.CopyToAsync(stream);
                saved.Add($"/images/{fileName}");
            }

            // merge with existing
            var existing = new List<string>();
            try { existing = System.Text.Json.JsonSerializer.Deserialize<List<string>>(villa.ImageUrlsJson) ?? new List<string>(); } catch {}
            existing.AddRange(saved);
            villa.ImageUrlsJson = System.Text.Json.JsonSerializer.Serialize(existing);
            await _context.SaveChangesAsync();
            return Ok(villa);
        }

        private bool VillaExists(int id)
        {
            return _context.Villas.Any(e => e.Id == id);
        }

        public record ContactRequest(string Name, string Email, string Message);
        [HttpPost("{id}/contact")]
        public async Task<IActionResult> ContactOwner(int id, [FromBody] ContactRequest body)
        {
            var villa = await _context.Villas.FindAsync(id);
            if (villa == null) return NotFound();

            var html = $"<p>New inquiry for {villa.Name}</p><p>From: {body.Name} ({body.Email})</p><p>Message:</p><p>{System.Net.WebUtility.HtmlEncode(body.Message)}</p>";
            var toEmail = _configuration["Notifications:AdminEmail"] ?? _configuration["SendGrid:FromEmail"] ?? "owner@example.com";
            await _emailService.SendAsync(toEmail, $"Inquiry: {villa.Name}", html);
            return Ok(new { message = "Inquiry sent" });
        }
    }
}
