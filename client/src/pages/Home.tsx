import type { Villa } from '../types/Villa';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllVillas } from '../services/villaService';

export default function Home() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllVillas()
      .then((data) => {
        setVillas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching villas:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading villas...</div>;
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {villas.map((villa) => (
        <div key={villa.id} className="border rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold">{villa.name}</h2>
          <p className="text-sm text-gray-600">{villa.description}</p>
          <p className="font-semibold mt-2 text-blue-600">${villa.pricePerNight}/night</p>
          <div className="flex justify-between mt-4">
            <Link to={`/villa/${villa.id}`}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Details
              </button>
            </Link>
            <Link to={`/reserve/${villa.id}`}>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Book Now
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
