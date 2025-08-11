import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Villa } from '../types/Villa';
import { useToast } from '../components/Toast';

const OwnerDashboard: React.FC = () => {
  const { push } = useToast();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Villa | null>(null);
  const [blocks, setBlocks] = useState<{ startDate: string; endDate: string }[]>([]);

  const load = async () => {
    setLoading(true);
    try { const res = await api.get<Villa[]>('/owner/properties'); setVillas(res.data); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!selected) return;
    await api.put(`/owner/properties/${selected.id}`, selected);
    push('Saved changes.', 'success');
    load();
  };
  const saveAvailability = async (id: number) => {
    await api.post(`/owner/properties/${id}/availability`, blocks);
    push('Availability updated.', 'success');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your properties</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-4">
          {loading ? 'Loading...' : (
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th>Name</th><th>Region</th><th>Price</th><th/></tr></thead>
              <tbody>
                {villas.map(v => (
                  <tr key={v.id} className="border-t border-neutral-200 dark:border-neutral-800">
                    <td>{v.name}</td>
                    <td>{v.region}</td>
                    <td>€{v.pricePerNight}</td>
                    <td className="text-right"><button className="btn" onClick={()=>setSelected(v)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-3">{selected ? `Edit ${selected.name}` : 'Select a property'}</h2>
          {selected && (
            <div className="space-y-3">
              <input className="input" placeholder="Name" value={selected.name} onChange={e=>setSelected({...selected, name: e.target.value})} />
              <input className="input" placeholder="Region" value={selected.region} onChange={e=>setSelected({...selected, region: e.target.value})} />
              <textarea className="input" placeholder="Description" value={selected.description} onChange={e=>setSelected({...selected, description: e.target.value})} />
              <input className="input" type="number" placeholder="Price per night" value={selected.pricePerNight} onChange={e=>setSelected({...selected, pricePerNight: Number(e.target.value)})} />
              <button className="bg-accent-600 text-white px-3 py-2 rounded" onClick={save}>Save</button>
              <div className="pt-2">
                <div className="font-medium mb-1">Blocked dates</div>
                <div className="space-y-2">
                  {blocks.map((b, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                      <input className="input" type="date" value={b.startDate} onChange={e=> setBlocks(bs=> bs.map((x,ix)=> ix===i? {...x, startDate: e.target.value}: x))} />
                      <input className="input" type="date" value={b.endDate} onChange={e=> setBlocks(bs=> bs.map((x,ix)=> ix===i? {...x, endDate: e.target.value}: x))} />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=> setBlocks(bs=> [...bs, { startDate: '', endDate: '' }])}>Add range</button>
                    <button className="btn" onClick={()=> setBlocks([])}>Clear</button>
                    <button className="bg-accent-600 text-white px-3 py-2 rounded" onClick={()=> saveAvailability(selected.id)}>Save availability</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;


