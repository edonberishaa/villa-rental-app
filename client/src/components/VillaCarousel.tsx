import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { ASSET_BASE_URL } from "../config";

interface Props{
  images: string;
}

const VillaCarousel: React.FC<Props> = ({ images }) => {
  let list: string[] = [];
  try { list = JSON.parse(images || "[]"); } catch {}
  const toFull = (p?: string) => (p && p.startsWith("http")) ? p : p ? `${ASSET_BASE_URL}${p}` : "";
  return (
    <Swiper spaceBetween={10} slidesPerView={1}>
      {list.map((image: string, index: number) => (
        <SwiperSlide key={index}>
          <img src={toFull(image)} alt={`Villa image ${index + 1}`} className="w-full h-64 object-cover rounded" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
export default VillaCarousel;