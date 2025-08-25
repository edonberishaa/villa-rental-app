import React, { useEffect, useMemo, useState } from "react";
import { useToast } from "../components/Toast";
import { useParams, useNavigate } from "react-router-dom";
import type { Villa } from "../types/Villa";
import { getVillaById } from "../services/villaService";
import { ASSET_BASE_URL } from "../config";
import Reviews from "../components/Reviews";
import { getReservedDatesForVilla } from "../services/reservationService";

const VillaDetailsPage: React.FC = () => {
  const { villaId } = useParams<{ villaId: string }>();
  const navigate = useNavigate();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reservedDates, setReservedDates] = useState<{ startDate: string; endDate: string }[]>([]);
  const { push } = useToast();

  useEffect(() => {
    const fetchVilla = async () => {
      if (!villaId) {
        setError("Villa ID is missing.");
        push("Villa ID is missing.", "error");
        setLoading(false);
        return;
      }
      try {
        const data = await getVillaById(Number(villaId));
        setVilla(data);
      } catch {
        setError("Villa not found.");
        push("Villa not found.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchVilla();
  }, [villaId]);

  useEffect(() => {
    const fetchReservedDates = async () => {
      if (!villaId) return;
      try {
        const dates = await getReservedDatesForVilla(Number(villaId));
        setReservedDates(dates);
      } catch {}
    };
    fetchReservedDates();
  }, [villaId]);

  const handleReserve = () => navigate(`/reserve/${villaId}`);
  const images: string[] = useMemo(() => {
    try {
      return villa?.imageUrlsJson ? JSON.parse(villa.imageUrlsJson) : [];
    } catch {
      return [];
    }
  }, [villa?.imageUrlsJson]);

  if (loading) return <p className="p-4 text-center">Loading villa details...</p>;
  if (error || !villa) return <p className="p-4 text-center text-red-600">{error}</p>;

  const fullImageUrl = (img: string) => (img.startsWith("http") ? img : `${ASSET_BASE_URL}${img}`);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title + Address */}
      <div>
  <h1 className="text-3xl font-bold">{villa.name}</h1>
  {villa.address && <p className="text-sm text-gray-600 mt-1">{villa.address}</p>}
  <div className="text-sm text-neutral-700 mt-1"><b>Owner phone:</b> {villa.phoneNumber}</div>
      </div>

      {/* Image + Booking Split */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Image Gallery */}
        <div className="md:col-span-2">
          {images.length > 0 ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={fullImageUrl(images[currentImageIndex])}
                alt={`Villa ${currentImageIndex + 1}`}
                className="w-full h-[400px] object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-1 rounded-full"
                  >
                    ◀
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-1 rounded-full"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              No Images Available
            </div>
          )}
          {/* Thumbnail Dots */}
          <div className="flex justify-center mt-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 w-2 rounded-full mx-1 ${
                  idx === currentImageIndex ? "bg-blue-600" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-white shadow-md rounded-xl p-6 self-start sticky top-6">
          <p className="text-2xl font-semibold text-green-600">
            €{villa.pricePerNight} <span className="text-base text-gray-600">/ night</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">Taxes and fees may apply</p>

          <button
            onClick={handleReserve}
            className="mt-6 w-full bg-accent-600 text-white py-3 rounded-lg font-semibold hover:bg-accent-700 transition"
          >
            Reserve Now
          </button>
        </div>
      </div>

      {/* Description, Amenities, Location */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">About this villa</h2>
          <p className="text-gray-700">{villa.description}</p>
          <h3 className="mt-6 text-lg font-semibold">Amenities</h3>
          <ul className="list-disc ml-5 mt-2 text-gray-600 space-y-1">
            <li>Free Wi-Fi</li>
            <li>Air conditioning</li>
            <li>Private parking</li>
            <li>Mountain view terrace</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Location</h2>
          {villa.latitude && villa.longitude ? (
            <iframe
              title="map"
              src={`https://www.google.com/maps?q=${villa.latitude},${villa.longitude}&z=14&output=embed`}
              className="w-full h-64 rounded-lg border"
              loading="lazy"
            />
          ) : (
            <div className="text-sm text-gray-500">No coordinates available.</div>
          )}
        </div>
      </div>

{/* Reserved Dates */}
{reservedDates.length > 0 && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-3">Datat e pa disponueshme</h3>
    <ul className="list-disc ml-5 text-red-700 space-y-1">
      {reservedDates.map((d, i) => {
        const start = new Date(d.startDate).toLocaleDateString("sq-AL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const end = new Date(d.endDate).toLocaleDateString("sq-AL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        return (
          <li key={i}>
            {start} deri më {end}
          </li>
        );
      })}
    </ul>
  </div>
)}


      {/* Reviews */}
      <div>
        <Reviews villaId={Number(villaId)} />
      </div>
    </div>
  );
};

export default VillaDetailsPage;
