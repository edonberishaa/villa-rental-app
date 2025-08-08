import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Villa } from "../types/Villa";
import { getVillaById } from "../services/villaService";

const VillaDetailsPage: React.FC = () => {
  const { villaId } = useParams<{ villaId: string }>();
  const navigate = useNavigate();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchVilla = async () => {
      if (!villaId) {
        setError("Villa ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await getVillaById(Number(villaId));
        setVilla(data);
      } catch (err) {
        setError("Villa not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchVilla();
  }, [villaId]);

  const handleBack = () => navigate("/");
  const handleReserve = () => navigate(`/reserve/${villaId}`);

  if (loading) return <p className="p-4 text-center">Loading villa details...</p>;
  if (error || !villa) return <p className="p-4 text-center text-red-600">{error}</p>;

  // Parse image URLs
  let images: string[] = [];
  if (typeof villa.imageUrlsJson === "string") {
    try {
      images = JSON.parse(villa.imageUrlsJson);
    } catch {
      images = [];
    }
  } else if (Array.isArray(villa.imageUrlsJson)) {
    images = villa.imageUrlsJson;
  }

  const fullImageUrl = (img: string) =>
    img.startsWith("https") ? img : `https://localhost:7021/${img}`;

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">{villa.name}</h2>

      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative mb-6">
          <img
            src={fullImageUrl(images[currentImageIndex])}
            alt={`Villa Image ${currentImageIndex + 1}`}
            className="w-full h-64 object-cover rounded"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 px-2 py-1 rounded-r hover:bg-opacity-100"
              >
                ◀
              </button>
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 px-2 py-1 rounded-l hover:bg-opacity-100"
              >
                ▶
              </button>
            </>
          )}
          {/* Dots */}
          <div className="flex justify-center mt-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 w-2 mx-1 rounded-full ${
                  currentImageIndex === index ? "bg-blue-600" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <p className="text-gray-700 mb-4">{villa.description}</p>
      <p className="text-xl font-semibold text-green-600 mb-6">
        ${villa.pricePerNight} / night
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Back to Home
        </button>
        <button
          onClick={handleReserve}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reserve Now
        </button>
      </div>
    </div>
  );
};

export default VillaDetailsPage;
