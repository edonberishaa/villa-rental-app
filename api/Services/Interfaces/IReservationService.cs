using api.DTOs;

namespace api.Services.Interfaces
{
    public interface IReservationService
    {
        Task<ReservationDTO> CreateReservationAsync(ReservationRequestDTO request);
        Task<bool> IsVillaAvailableAsync(int villaId, DateTime startDate, DateTime endDate);
        Task<bool> ConfirmReservationAsync(int reservationId);
        Task<bool> ConfirmReservationByCodeAsync(string reservationCode);
        Task<List<ReservationListDTO>> GetAllReservationsAsync();
        Task<ReservationListDTO?> GetReservationByIdAsync(int id);
        Task<ReservationListDTO?> GetReservationByCodeAsync(string reservationCode);
    }
}
