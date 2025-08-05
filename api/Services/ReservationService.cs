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
        public async Task<bool> IsVillaAvailableAsync(int villaId, DateTime start, DateTime end)
        {
            if (start > end)
                throw new ArgumentException("Start date cannot be after end date");

            bool isBlocked = await _context.BlockedDates
                .AnyAsync(b => b.VillaId == villaId &&
                               b.StartDate <= end &&
                               start <= b.EndDate);

            bool hasReservation = await _context.Reservations
                .AnyAsync(r => r.VillaId == villaId &&
                               r.Status != ReservationStatus.Cancelled &&
                               r.StartDate <= end &&
                               start <= r.EndDate);

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

            int nights = (request.EndDate - request.StartDate).Days + 1;
            decimal fee = villa.PricePerNight * 0.20m; // 20% upfront

            var reservation = new Reservation
            {
                VillaId = request.VillaId,
                GuestName = request.GuestName,
                GuestPhone = request.GuestPhone,
                GuestEmail = request.GuestEmail,
                GuestsCount = request.GuestsCount,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
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
