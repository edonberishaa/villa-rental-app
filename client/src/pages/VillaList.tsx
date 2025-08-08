import React from "react";
import type { Villa } from "../types/Villa";
import VillaCard from "../components/VillaCard";
interface VillaListProps {
  villas: Villa[];
}

const VillaList: React.FC<VillaListProps> = ({ villas }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Available Villas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {villas.map((villa) => (
          <VillaCard key={villa.id} villa={villa} />
        ))}
      </div>
    </div>
  );
};

export default VillaList;
