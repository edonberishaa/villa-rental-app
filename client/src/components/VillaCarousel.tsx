import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
 // Import Swiper styles

interface Props{
    images: string;
}

const VillaCarousel: React.FC<Props> = ({ images }) => {
    return (
        <Swiper spaceBetween={10} slidesPerView={1} >
            {JSON.parse(images).map((image: string, index: number) => (
                <SwiperSlide key={index}>
                    <img src={image} alt={`Villa image ${index + 1}`} className="w-full h-64 object-cover rounded" />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
export default VillaCarousel;