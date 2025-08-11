import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Villa } from "../types/Villa";
import { getVillaById } from "../services/villaService";
import { ASSET_BASE_URL } from "../config";
// import ContactForm from "../components/ContactForm";
import Reviews from "../components/Reviews";

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

  const images: string[] = useMemo(() => {
    const json = villa?.imageUrlsJson;
    try { return json ? JSON.parse(json) : []; } catch { return []; }
  }, [villa?.imageUrlsJson]);

  if (loading) return <p className="p-4 text-center">Loading villa details...</p>;
  if (error || !villa) return <p className="p-4 text-center text-red-600">{error}</p>;

  const fullImageUrl = (img: string) =>
    img.startsWith("http") ? img : `${ASSET_BASE_URL}${img}`;

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{villa.name}</h2>
        <span className="text-sm text-neutral-500">{images.length} photos</span>
      </div>
      {villa.address && <div className="text-sm text-neutral-500 mb-2">{villa.address}</div>}

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

      <p className="text-gray-700 dark:text-neutral-300 mb-4">{villa.description}</p>
      <p className="text-xl font-semibold text-green-600 mb-6">
        ${villa.pricePerNight} / night
      </p>

      <div className="flex gap-4">
        <button onClick={handleBack} className="btn">
          Back to Home
        </button>
        <button onClick={handleReserve} className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-600/90">
          Reserve Now
        </button>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Amenities</h3>
          <ul className="list-disc ml-5 text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
            <li>Free Wi‑Fi</li>
            <li>Air conditioning</li>
            <li>Private parking</li>
            <li>Mountain view terrace</li>
          </ul>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Location</h3>
          {villa.latitude && villa.longitude ? (
            <iframe
              title="map"
              src={`https://www.google.com/maps?q=${villa.latitude},${villa.longitude}&z=14&output=embed`}
              width="100%"
              height="250"
              loading="lazy"
              className="rounded"
            />
          ) : (
            <div className="text-sm text-neutral-500">No coordinates provided.</div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Reviews villaId={Number(villaId)} />
      </div>
    </div>
  );
};

export default VillaDetailsPage;
