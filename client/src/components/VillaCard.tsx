import React from "react";
import type { Villa } from "../types/Villa";

interface VillaCardProps {
  villa: Villa;
}

const VillaCard: React.FC<VillaCardProps> = ({ villa }) => {
  const imageUrls: string[] = JSON.parse(villa.imageUrlsJson);
  const firstImage = imageUrls[0];

  return (
    <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-200 transition transform hover:scale-105 hover:shadow-xl">
      <img
        className="w-full h-64 object-cover"
        src={firstImage}
        alt={villa.name}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{villa.name}</h3>
        <p className="text-gray-500 text-sm mb-1">{villa.region}</p>
        <p className="text-gray-600 text-sm mb-3">{villa.description}</p>
        <div className="text-right">
          <span className="text-primary-600 font-bold text-lg">
            €{villa.pricePerNight} <span className="text-sm text-gray-500">/ night</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VillaCard;
