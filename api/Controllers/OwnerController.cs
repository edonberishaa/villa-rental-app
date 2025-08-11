using api.Data;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/owner")] 
    [Authorize]
    public class OwnerController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OwnerController(AppDbContext context) { _context = context; }

        [HttpGet("properties")]
        public async Task<IActionResult> MyProperties()
        {
            var email = User?.Identity?.Name ?? User?.FindFirst("email")?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized();
            var villas = await _context.Villas.Where(v=> v.OwnerEmail == email).ToListAsync();
            return Ok(villas);
        }

        [HttpPut("properties/{id}")]
        public async Task<IActionResult> UpdateVilla(int id, [FromBody] Villa update)
        {
            var email = User?.Identity?.Name ?? User?.FindFirst("email")?.Value;
            var villa = await _context.Villas.FindAsync(id);
            if (villa == null) return NotFound();
            if (!string.Equals(villa.OwnerEmail, email, StringComparison.OrdinalIgnoreCase)) return Forbid();
            villa.Name = update.Name; villa.Region = update.Region; villa.Description = update.Description; villa.PricePerNight = update.PricePerNight;
            villa.AmenitiesJson = update.AmenitiesJson; villa.Address = update.Address; villa.Latitude = update.Latitude; villa.Longitude = update.Longitude;
            villa.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(villa);
        }

        [HttpPost("properties/{id}/availability")]
        public async Task<IActionResult> MarkAvailability(int id, [FromBody] List<BlockedDate> blocks)
        {
            var email = User?.Identity?.Name ?? User?.FindFirst("email")?.Value;
            var villa = await _context.Villas.FindAsync(id);
            if (villa == null) return NotFound();
            if (!string.Equals(villa.OwnerEmail, email, StringComparison.OrdinalIgnoreCase)) return Forbid();
            var existing = _context.BlockedDates.Where(b=> b.VillaId == id);
            _context.BlockedDates.RemoveRange(existing);
            foreach (var b in blocks)
            {
                b.VillaId = id;
                _context.BlockedDates.Add(b);
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}


