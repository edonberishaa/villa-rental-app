import type { Villa } from '../types/Villa';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getAllVillas } from '../services/villaService';
import VillaCard from '../components/VillaCard';
import { useToast } from '../components/Toast';

export default function Home() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  // Compute region options with counts
  const regionOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    villas.forEach(v => {
      if (v.region) counts[v.region] = (counts[v.region] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [villas]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState('');

  const { push } = useToast();

  useEffect(() => {
    getAllVillas()
      .then((data) => {
        setVillas(data);
        setLoading(false);
      })
      .catch(() => {
        push('Failed to load villas', 'error');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = [...villas];
    // Sort promoted villas first
    list.sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0));
    if (query)
      list = list.filter((v) =>
        `${v.name} ${v.region} ${v.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    if (region) list = list.filter((v) => v.region === region);
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined) list = list.filter((v) => v.pricePerNight >= min);
    if (max !== undefined) list = list.filter((v) => v.pricePerNight <= max);
    if (sort === 'priceAsc') list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sort === 'priceDesc') list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    return list;
  }, [villas, query, region, minPrice, maxPrice, sort]);

  if (loading) {
    return <div className="p-4 text-center">Loading villas...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Hero / Banner */}
      <section className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-16 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl md:text-4xl font-bold">
          Miresevini ne vendin ku gjeni villat me te mira ne rajon!
        </h1>
        <p className="mt-3 text-lg text-teal-100">
          Zgjidhni villën tuaj të ëndrrave për pushime perfekte.
        </p>
      </section>

      {/* Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 shadow-md h-fit">
          <h2 className="text-lg font-semibold mb-2">Filtro</h2>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kërko emër, rajon..."
            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900"
          />

          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900"
          >
            <option value="">Të gjitha rajonet</option>
            {regionOptions.map(([reg, count]) => (
              <option key={reg} value={reg}>{reg} ({count})</option>
            ))}
          </select>

          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Çmimi min"
            type="number"
            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900"
          />

          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Çmimi max"
            type="number"
            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 bg-white dark:bg-neutral-900"
          >
            <option value="">Rendit</option>
            <option value="priceAsc">Çmimi: nga më i ulëti</option>
            <option value="priceDesc">Çmimi: nga më i larti</option>
          </select>
        </aside>

        {/* Villas Grid */}
        <main className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500">Asnjë vilë nuk u gjet</div>
          ) : (
            filtered.map((villa) => (
              <Link key={villa.id} to={`/villa/${villa.id}`}>
                <VillaCard villa={villa} />
              </Link>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
