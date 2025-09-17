import React, { useEffect, useState } from "react";
import api from "../services/api";
import VillaCard from "../components/VillaCard";
import { useAuth } from "../context/AuthContext";

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get("/wishlist").then(res => {
        setItems(res.data);
        setLoading(false);
      });
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please sign in to view your wishlist.</div>;
  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-gray-500">No favorites yet. Start adding villas to your wishlist!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <VillaCard key={item.id} villa={item.villa} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
