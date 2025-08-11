import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';

const AMENITIES = ['WiFi','Air conditioning','Parking','Pool','Kitchen','Washer','Heating'];

const SubmitProperty: React.FC = () => {
  const { push } = useToast();
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  // const [files, setFiles] = useState<FileList | null>(null);

  const toggleAmenity = (a: string) => setAmenities(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev,a]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create submission
      await api.post('/submissions', {
        ownerEmail: JSON.parse(localStorage.getItem('user') || '{}')?.email || 'unknown@owner',
        name, region, description, pricePerNight: price,
        imageUrlsJson: '[]', amenitiesJson: JSON.stringify(amenities), address, latitude: lat? Number(lat): null, longitude: lng? Number(lng): null
      });
      // Upload images similar to villas upload to reuse files endpoint: store paths into submission for admin view (optional: a new endpoint); for simplicity, attach files to a temp villa after approval. Here we skip immediate upload and let admin request images.
      push('Submitted! We will review your property shortly.', 'success');
      setName(''); setRegion(''); setDescription(''); setPrice(0); setAmenities([]); setAddress(''); setLat(''); setLng('');
    } catch (e) {
      // handled by interceptor; no-op
    }
  };

  return (
    <div className="max-w-2xl mx-auto card p-6">
      <h1 className="text-2xl font-semibold mb-4">List your property</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="input" placeholder="Region" value={region} onChange={e=>setRegion(e.target.value)} required />
        <textarea className="input" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <input className="input" type="number" placeholder="Price per night" value={price} onChange={e=>setPrice(Number(e.target.value))} />
        <div>
          <div className="font-medium mb-2">Amenities</div>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map(a => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={amenities.includes(a)} onChange={()=>toggleAmenity(a)} /> {a}
              </label>
            ))}
          </div>
        </div>
        <input className="input" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="Latitude" value={lat} onChange={e=>setLat(e.target.value)} />
          <input className="input" placeholder="Longitude" value={lng} onChange={e=>setLng(e.target.value)} />
        </div>
        {/* Optional: allow attaching preview images in a follow-up iteration */}
        <button className="bg-accent-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
};

export default SubmitProperty;


