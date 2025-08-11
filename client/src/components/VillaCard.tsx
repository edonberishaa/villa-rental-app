import React from "react";
import type { Villa } from "../types/Villa";
import { ASSET_BASE_URL } from "../config";

interface VillaCardProps {
  villa: Villa;
}

const VillaCard: React.FC<VillaCardProps> = ({ villa }) => {
  const imageUrls: string[] = JSON.parse(villa.imageUrlsJson || "[]");
  const toFull = (p?: string) => (p && p.startsWith("http")) ? p : p ? `${ASSET_BASE_URL}${p}` : "";
  const firstImage = toFull(imageUrls[0]);

  return (
    <div className="max-w-sm rounded-2xl overflow-hidden shadow-soft bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-transform hover:scale-[1.01]">
      <img
        className="w-full h-64 object-cover"
        src={firstImage}
        alt={villa.name}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{villa.name}</h3>
        <p className="text-neutral-500 text-sm mb-1">{villa.region}</p>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3 line-clamp-2">{villa.description}</p>
        <div className="text-right">
          <span className="text-accent-600 font-bold text-lg">
            €{villa.pricePerNight} <span className="text-sm text-neutral-500">/ night</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VillaCard;
