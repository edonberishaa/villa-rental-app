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
            CreateMap<Reservation, ReservationListDTO>()
    .ForMember(dest => dest.VillaName, opt => opt.MapFrom(src => src.Villa.Name));

        }
    }
}
