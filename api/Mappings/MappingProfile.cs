using api.DTOs;
using api.Models;
using AutoMapper;

namespace api.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Reservation, ReservationDTO>().ReverseMap();
            CreateMap<Reservation, ReservationRequestDTO>().ReverseMap();
        }
    }
}
