using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VillasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VillasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Villas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Villa>>> GetVillas()
        {
            return await _context.Villas.ToListAsync();
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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

            return NoContent();
        }

        // POST: api/Villas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Villa>> PostVilla(Villa villa)
        {
            _context.Villas.Add(villa);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVilla", new { id = villa.Id }, villa);
        }

        // DELETE: api/Villas/5
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

        private bool VillaExists(int id)
        {
            return _context.Villas.Any(e => e.Id == id);
        }
    }
}
