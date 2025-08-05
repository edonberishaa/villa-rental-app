using api.DTOs;

namespace api.Services.Interfaces
{
    public interface IReservationService
    {
        Task<ReservationDTO> CreateReservationAsync(ReservationRequestDTO request);
        Task<bool> IsVillaAvailableAsync(int villaId, DateTime startDate, DateTime endDate);
        Task<bool> ConfirmReservationAsync(int reservationId);
        Task<List<ReservationDTO>> GetAllReservationsAsync();
        Task<ReservationDTO> GetReservationByIdAsync(int id);
    }
}
