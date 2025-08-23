import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllVillas, createVilla, updateVilla, deleteVilla } from '../services/villaService';
import type { Villa } from '../types/Villa';
import api from '../services/api';
import { useToast } from '../components/Toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Villa | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  const { push } = useToast();
  useEffect(() => {
    getAllVillas()
      .then(v => { setVillas(v); setLoading(false); })
      .catch(() => { push('Failed to load villas', 'error'); setLoading(false); });
  }, []);

  const save = async () => {
    if (!selected) return;
    try {
      let result: Villa;
      if (selected.id) result = await updateVilla(selected.id, selected);
      else result = await createVilla(selected);

      let updated: Villa = result;
      if (files && result.id) {
        const form = new FormData();
        Array.from(files).forEach(f => form.append('files', f));
        const uploadRes = await api.post(`/villas/${result.id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        updated = uploadRes.data as Villa;
      }

      setVillas(prev => {
        const ix = prev.findIndex(v => v.id === updated.id);
        if (ix >= 0) { const copy = [...prev]; copy[ix] = updated; return copy; }
        return [updated, ...prev];
      });

      setSelected(null); setFiles(null);
    } catch (err: any) {
      push(err?.response?.data?.message || 'Failed to save villa.', 'error');
    }
  };

  const startNew = () => setSelected({ id: 0, name: '', region: '', description: '', pricePerNight: 0, imageUrlsJson: '[]' } as any);

  if (!user) return <div className="p-6">Sign in as admin.</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <button className="bg-accent-600 text-white px-4 py-2 rounded" onClick={startNew}>New villa</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-4">
          {loading ? 'Loading...' : (
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th>Name</th><th>Region</th><th>Price</th><th /></tr></thead>
              <tbody>
                {villas.map(v => (
                  <tr key={v.id} className="border-t border-neutral-200 dark:border-neutral-800">
                    <td>{v.name}</td>
                    <td>{v.region}</td>
                    <td>€{v.pricePerNight}</td>
                    <td className="text-right space-x-2">
                      <button className="btn" onClick={()=>setSelected(v)}>Edit</button>
                      <button className="btn" onClick={async()=>{ await deleteVilla(v.id); setVillas(prev=>prev.filter(x=>x.id!==v.id)); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-3">{selected?.id ? 'Edit villa' : 'New villa'}</h2>
          {selected ? (
            <div className="space-y-3">
              <input className="input" placeholder="Name" value={selected.name} onChange={e=>setSelected({...selected, name: e.target.value})} />
              <input className="input" placeholder="Region" value={selected.region} onChange={e=>setSelected({...selected, region: e.target.value})} />
              <textarea className="input" placeholder="Description" value={selected.description} onChange={e=>setSelected({...selected, description: e.target.value})} />
              <input className="input" type="number" placeholder="Price per night" value={selected.pricePerNight} onChange={e=>setSelected({...selected, pricePerNight: Number(e.target.value)})} />
              <div>
                <div className="font-medium mb-1">Amenities</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['WiFi','Air conditioning','Parking','Pool','Kitchen','Washer','Heating'].map(a => (
                    <label key={a} className="flex items-center gap-2">
                      <input type="checkbox" onChange={(e)=>{
                        const arr = JSON.parse((selected as any).amenitiesJson || '[]') as string[];
                        const next = e.target.checked ? Array.from(new Set([...arr,a])) : arr.filter(x=>x!==a);
                        setSelected({ ...(selected as any), amenitiesJson: JSON.stringify(next) });
                      }} checked={(() => { try { return (JSON.parse((selected as any).amenitiesJson || '[]') as string[]).includes(a);} catch { return false; } })()} /> {a}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="input" placeholder="Address" onChange={e=>setSelected({ ...(selected as any), address: e.target.value })} value={(selected as any).address || ''} />
                <input className="input" placeholder="Latitude" onChange={e=>setSelected({ ...(selected as any), latitude: e.target.value })} value={(selected as any).latitude || ''} />
                <input className="input" placeholder="Longitude" onChange={e=>setSelected({ ...(selected as any), longitude: e.target.value })} value={(selected as any).longitude || ''} />
              </div>
              <input className="input" type="file" multiple onChange={e=>setFiles(e.target.files)} />
              <div className="flex gap-2">
                <button className="bg-accent-600 text-white px-3 py-2 rounded" onClick={save}>Save</button>
                <button className="btn" onClick={()=>{setSelected(null); setFiles(null);}}>Cancel</button>
              </div>
            </div>
          ) : <div className="text-neutral-500 text-sm">Select a villa to edit or create a new one.</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


