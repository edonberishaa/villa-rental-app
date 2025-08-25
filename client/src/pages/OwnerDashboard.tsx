import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Villa } from '../types/Villa';
import { useToast } from '../components/Toast';
import { getReservationsForOwnedVilla } from '../services/reservationService';
import { useNavigate } from "react-router-dom";
import { deleteVilla } from '../services/ownerService';
import { promoteVilla } from '../services/paymentService';
import { fetchPublishableKey } from '../services/api';
import StripePaymentForm from '../components/StripePaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const OwnerDashboard: React.FC = () => {
  const { push } = useToast();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Villa | null>(null);
  const [blocks, setBlocks] = useState<{ startDate: string; endDate: string }[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [promoteModal, setPromoteModal] = useState<{ open: boolean; villa: Villa | null }>({ open: false, villa: null });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [promoteLoading, setPromoteLoading] = useState(false);

  // Stripe publishable key is fetched once and cached
  const [stripe, setStripe] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const key = await fetchPublishableKey();
      setStripe(loadStripe(key));
    })();
  }, []);
  const navigate = useNavigate();

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
  const loadReservations = async (villaId: number) => {
    setReservationsLoading(true);
    try {
      const data = await getReservationsForOwnedVilla(villaId);
      setReservations(data);
    } finally {
      setReservationsLoading(false);
    }
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
                    <td className="text-right">
                      <button className="btn" onClick={()=>setSelected(v)}>Edit</button>
                      {!v.isPromoted && (
                        <button className="btn ml-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white" onClick={async () => {
                          setPromoteModal({ open: true, villa: v });
                          setPromoteLoading(true);
                          // stripePromise is now set at top-level
                          try {
                            const { clientSecret } = await promoteVilla(v.id);
                            setClientSecret(clientSecret);
                          } catch (e: any) {
                            push(e?.response?.data?.message || 'Failed to start promotion payment', 'error');
                            setPromoteModal({ open: false, villa: null });
                          } finally {
                            setPromoteLoading(false);
                          }
                        }}>Promote</button>
                      )}
                    </td>
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
              <button className="btn mb-2" onClick={() => navigate(`/owner/villa/${selected.id}`)}>View Villa</button>
              <button className="btn mb-2 bg-red-600 text-white" onClick={async () => {
                if (window.confirm('Are you sure you want to remove this villa from listing?')) {
                  await deleteVilla(selected.id);
                  push('Villa removed.', 'success');
                  setSelected(null);
                  load();
                }
              }}>Remove Villa</button>
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
                <div className="mt-4">
                  <button className="btn" onClick={() => loadReservations(selected.id)}>
                    {reservationsLoading ? 'Loading...' : 'Show Reservations'}
                  </button>
                  {reservations.length > 0 && (
                    <div className="mt-2">
                      <h3 className="font-semibold mb-1">Reservations</h3>
                      <ul className="list-disc ml-5 text-sm space-y-1">
                        {reservations.map((r, i) => (
                          <li key={i}>
                            {r.guestName || r.guestEmail || 'Guest'}: {r.startDate} to {r.endDate} (Status: {r.status})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {promoteModal.open && promoteModal.villa && stripe && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setPromoteModal({ open: false, villa: null })}>&times;</button>
            <h2 className="text-xl font-semibold mb-4">Promote {promoteModal.villa.name}</h2>
            <Elements stripe={stripe} options={{ clientSecret }}>
              <StripePaymentForm clientSecret={clientSecret} onSuccess={() => {
                push('Villa promoted successfully!', 'success');
                setPromoteModal({ open: false, villa: null });
                setClientSecret(null);
                load();
              }} amount={4} promoted={true} />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;


