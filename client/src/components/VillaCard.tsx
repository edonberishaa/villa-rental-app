import React, { useState } from "react";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWishlist = async () => {
    if (!user) return alert("Sign in to use wishlist");
    setLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(villa.id);
        setWishlisted(false);
      } else {
        await addToWishlist(villa.id);
        setWishlisted(true);
      }
    } catch (e) {
      alert("Could not update wishlist");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Wishlist button */}
        <button
          className={`absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-pink-100 transition ${wishlisted ? "text-pink-600" : "text-gray-400"}`}
          onClick={handleWishlist}
          disabled={loading}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
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
