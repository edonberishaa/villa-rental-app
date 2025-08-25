import React from "react";
import type { Villa } from "../types/Villa";
import { ASSET_BASE_URL } from "../config";

interface VillaCardProps {
  villa: Villa & { isPromoted?: boolean };
}

const VillaCard: React.FC<VillaCardProps> = ({ villa }) => {
  const imageUrls: string[] = JSON.parse(villa.imageUrlsJson || "[]");
  const toFull = (p?: string) =>
    p && p.startsWith("http") ? p : p ? `${ASSET_BASE_URL}${p}` : "";
  const firstImage = toFull(imageUrls[0]);

  return (
    <div
      className={
        "rounded-xl shadow-md overflow-hidden relative transition-all " +
        (villa.isPromoted
          ? "border-4 border-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 p-1"
          : "bg-white")
      }
    >
      <div className={villa.isPromoted ? "rounded-lg bg-white" : ""}>
        {villa.isPromoted && (
          <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Promoted
          </span>
        )}
        <img
          className="w-full h-48 object-cover object-center rounded-t-lg"
          src={firstImage}
          alt={villa.name}
        />
        <div className="p-6">
          <span className="inline-block bg-teal-200 text-teal-800 py-1 px-3 text-xs rounded-full uppercase font-semibold tracking-wide">
            {villa.region}
          </span>

          <h3 className="mt-2 font-semibold text-lg leading-tight truncate">
            {villa.name}
          </h3>

          <p className="mt-2 text-gray-600 text-sm line-clamp-2">
            {villa.description}
          </p>

          <div className="mt-3">
            <span className="text-accent-600 font-bold text-lg">
              €{villa.pricePerNight}
            </span>
            <span className="text-gray-600 text-sm"> / night</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillaCard;
