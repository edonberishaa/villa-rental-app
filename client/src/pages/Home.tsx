import type { Villa } from '../types/Villa';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getAllVillas } from '../services/villaService';
import VillaCard from '../components/VillaCard';

export default function Home() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState('');

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

  const filtered = useMemo(() => {
    let list = [...villas];
    if (query) list = list.filter(v => `${v.name} ${v.region} ${v.description}`.toLowerCase().includes(query.toLowerCase()));
    if (region) list = list.filter(v => v.region === region);
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined) list = list.filter(v => v.pricePerNight >= min);
    if (max !== undefined) list = list.filter(v => v.pricePerNight <= max);
    if (sort === 'priceAsc') list.sort((a,b)=> a.pricePerNight - b.pricePerNight);
    if (sort === 'priceDesc') list.sort((a,b)=> b.pricePerNight - a.pricePerNight);
    return list;
  }, [villas, query, region, minPrice, maxPrice, sort]);

  if (loading) {
    return <div className="p-4 text-center">Loading villas...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-800 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, region..." className="border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900" />
          <input value={region} onChange={e=>setRegion(e.target.value)} placeholder="Region" className="border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900" />
          <input value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="Min price" type="number" className="border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900" />
          <input value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Max price" type="number" className="border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900" />
          <select value={sort} onChange={e=>setSort(e.target.value)} className="border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900">
            <option value="">Sort</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((villa) => (
          <Link key={villa.id} to={`/villa/${villa.id}`}>
            <VillaCard villa={villa} />
          </Link>
        ))}
      </div>
    </div>
  );
}
