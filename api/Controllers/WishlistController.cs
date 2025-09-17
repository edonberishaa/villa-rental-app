using api.Data;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace api.Controllers
{
    [ApiController]
    [Route("api/wishlist")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;
        public WishlistController(AppDbContext context) { _context = context; }

        // Get current user's wishlist
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                         ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var items = await _context.WishlistItems
                .Include(w => w.Villa)
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.AddedAt)
                .ToListAsync();
            return Ok(items);
        }

        // Add villa to wishlist
        [HttpPost("add/{villaId}")]
        public async Task<IActionResult> AddToWishlist(int villaId)
        {
                        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                         ?? User.FindFirst("id")?.Value;
            // var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var exists = await _context.WishlistItems.AnyAsync(w => w.UserId == userId && w.VillaId == villaId);
            if (exists) return BadRequest("Already in wishlist.");
            var villaExists = await _context.Villas.AnyAsync(v => v.Id == villaId);
            if (!villaExists) return NotFound("Villa not found.");
            var item = new WishlistItem { UserId = userId, VillaId = villaId };
            _context.WishlistItems.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // Remove villa from wishlist
        [HttpDelete("remove/{villaId}")]
        public async Task<IActionResult> RemoveFromWishlist(int villaId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                         ?? User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var item = await _context.WishlistItems.FirstOrDefaultAsync(w => w.UserId == userId && w.VillaId == villaId);
            if (item == null) return NotFound("Not in wishlist.");
            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
