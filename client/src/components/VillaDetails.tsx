// src/pages/VillaDetailsPage.tsx
import { useParams } from "react-router-dom";
import type { Villa } from "../types/Villa";
import VillaCarousel from "../components/VillaCarousel";
import { getVillaById } from "../services/villaService";
import { useEffect, useState } from "react";

const VillaDetailsPage =() => {
  const { id } = useParams();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if(!id) return;

    getVillaById(Number(id))
      .then((data) => {
        setVilla(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching villa details:", error);
        setError("Failed to load villa details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading villa details...</div>;
  if (error || !villa) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">{villa.name}</h1>
      <p className="text-gray-500 mb-4">{villa.region}</p>
      <VillaCarousel images={villa.imageUrlsJson} />
      <p className="mt-6 text-lg">{villa.description}</p>
      <p className="mt-2 font-bold text-xl">${villa.pricePerNight}/night</p>

      <div className="mt-6">
        <iframe
          title="map"
          src={`https://www.google.com/maps?q=${encodeURIComponent(villa.region)}&output=embed`}
          width="100%"
          height="300"
          loading="lazy"
          className="rounded"
        />
      </div>
    </div>
  );
};

export default VillaDetailsPage;

