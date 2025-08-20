using api.Data;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/owner")] 
    [Authorize]
    public class OwnerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        public OwnerController(AppDbContext context, UserManager<AppUser> userManager) { _context = context; _userManager = userManager; }
        [HttpGet("whoami")]

public IActionResult WhoAmI()
{
    return Ok(new {
        Name = User.Identity?.Name,
        Claims = User.Claims.Select(c => new { c.Type, c.Value })
    });
}

        [Authorize(Roles = "Customer")]
        [HttpPost("request-access")]
        public async Task<IActionResult> RequestOwnerAccess()
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized("User is not authenticated");
            }

            // Debug: List all claims
            var claimsDebug = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            Console.WriteLine("User Claims:");
            foreach (var c in claimsDebug)
            {
                Console.WriteLine($"{c.Type}: {c.Value}");
            }

            // Attempt to get userId from claims
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                         ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID claim missing");
            }


            // Existing logic
            var existing = await _context.OwnerRequests.FirstOrDefaultAsync(r => r.UserId == userId && r.Approved == null);
            if (existing != null) return BadRequest("You already have a pending request.");

            var req = new OwnerRequest { UserId = userId };
            _context.OwnerRequests.Add(req);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Request submitted. Await admin approval." });
        }

        // Admin: view all owner requests
        [HttpGet("requests")]
        public async Task<IActionResult> GetOwnerRequests()
        {
            var requests = await _context.OwnerRequests.Include(r => r.User).OrderByDescending(r => r.RequestedAt).ToListAsync();
            return Ok(requests.Select(r => new
            {
                r.Id,
                User = new { r.User.Id, r.User.Email, r.User.FullName },
                r.RequestedAt,
                r.Approved,
                r.RespondedAt,
                r.AdminId
            }));
        }

        // Admin: approve owner request
        [HttpPost("requests/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOwnerRequest(int id)
        {
            var req = await _context.OwnerRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);
            if (req == null) return NotFound();
            if (req.Approved != null) return BadRequest("Request already handled.");
            req.Approved = true;
            req.RespondedAt = DateTime.UtcNow;
            req.AdminId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
            // Add Owner role
            await _userManager.AddToRoleAsync(req.User, "Owner");
            await _context.SaveChangesAsync();
            return Ok(new { message = "User promoted to Owner." });
        }

        // Admin: refuse owner request
        [HttpPost("requests/{id}/refuse")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RefuseOwnerRequest(int id)
        {
            var req = await _context.OwnerRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);
            if (req == null) return NotFound();
            if (req.Approved != null) return BadRequest("Request already handled.");
            req.Approved = false;
            req.RespondedAt = DateTime.UtcNow;
            req.AdminId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Request refused." });
        }

        [HttpGet("properties")]
        public async Task<IActionResult> MyProperties()
        {
            var email = User?.Identity?.Name ?? User?.FindFirst("email")?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized();
            var villas = await _context.Villas.Where(v => v.OwnerEmail == email).ToListAsync();
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
            var existing = _context.BlockedDates.Where(b => b.VillaId == id);
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


