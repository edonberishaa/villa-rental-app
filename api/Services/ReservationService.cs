using api.Data;
using api.DTOs;
using api.Models;
using api.Services.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class ReservationService : IReservationService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ReservationService(AppDbContext context,IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<ReservationDTO>> GetAllReservationsAsync()
        {
            var reservations = await _context.Reservations
                .Include(r => r.Villa)
                .ToListAsync();
            return _mapper.Map<List<ReservationDTO>>(reservations);
        }
        public async Task<ReservationDTO?> GetReservationByIdAsync(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Villa)
                .FirstOrDefaultAsync(r => r.Id == id);

            return reservation == null ? null : _mapper.Map<ReservationDTO>(reservation);
        } 
        public async Task<ReservationDTO?> GetReservationByCodeAsync(string reservationCode)
        {
            var reservation = await _context.Reservations.Include(r=>r.Villa)
                .FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);
            return reservation == null ? null : _mapper.Map<ReservationDTO>(reservation);
        }

        public async Task<bool> ConfirmReservationAsync(int reservationId)
        {
            var reservation = await _context.Reservations.FindAsync(reservationId);
            if(reservation == null || reservation.Status == ReservationStatus.Confirmed)
            {
                return false;
            }

            reservation.Status = ReservationStatus.Confirmed;
            await _context.SaveChangesAsync();

            return true;

        }
        public async Task<bool> ConfirmReservationByCodeAsync(string reservationCode)
        {
            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.ReservationCode == reservationCode);
            if (reservation == null || reservation.Status == ReservationStatus.Confirmed)
            {
                return false;
            }
            reservation.Status = ReservationStatus.Confirmed;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> IsVillaAvailableAsync(int villaId, DateTime start, DateTime end)
        {
            start = start.Date;
            end = end.Date;
            if (end <= start)
                throw new ArgumentException("End date must be after start date");

            bool isBlocked = await _context.BlockedDates
                .AnyAsync(b => b.VillaId == villaId &&
                               b.StartDate < end &&
                               start < b.EndDate);

            bool hasReservation = await _context.Reservations
                .AnyAsync(r => r.VillaId == villaId &&
                               r.Status != ReservationStatus.Cancelled &&
                               r.StartDate < end &&
                               start < r.EndDate);

            return !isBlocked && !hasReservation;
        }

        public async Task<ReservationDTO> CreateReservationAsync(ReservationRequestDTO request)
        {
            var villa = await _context.Villas.FindAsync(request.VillaId);
            if (villa == null)
                throw new KeyNotFoundException("Villa not found");

            bool available = await IsVillaAvailableAsync(request.VillaId, request.StartDate, request.EndDate);
            if (!available)
                throw new InvalidOperationException("Villa is not available for the selected dates.");

            var start = request.StartDate.Date;
            var end = request.EndDate.Date;
            int nights = (end - start).Days; // end-exclusive
            if (nights <= 0) throw new InvalidOperationException("End date must be after start date.");
            decimal total = villa.PricePerNight * nights;
            decimal fee = Math.Round(total * 0.20m, 2, MidpointRounding.AwayFromZero); // 20% upfront

            var reservation = new Reservation
            {
                VillaId = request.VillaId,
                GuestName = request.GuestName,
                GuestPhone = request.GuestPhone,
                GuestEmail = request.GuestEmail,
                GuestsCount = request.GuestsCount,
                StartDate = start,
                EndDate = end,
                ReservationFeeAmount = fee,
                ReservationCode = $"VR-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                Status = ReservationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return new ReservationDTO
            {
                ReservationCode = reservation.ReservationCode,
                FeeAmount = reservation.ReservationFeeAmount
            };
        }
    }
}
