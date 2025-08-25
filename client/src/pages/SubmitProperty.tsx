
import React, { useState } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { fetchPublishableKey } from '../services/api';
import { createVillaListingPayment } from '../services/paymentService';
import StripePaymentForm from '../components/StripePaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const AMENITIES = ['WiFi','Air conditioning','Parking','Pool','Kitchen','Washer','Heating'];


const SubmitProperty: React.FC = () => {
  const { push } = useToast();
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [price, setPrice] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [step, setStep] = useState<'form'|'payment'|'done'>('form');
  const [submissionId, setSubmissionId] = useState<number|null>(null);
  const [promoted, setPromoted] = useState(false);
  const [clientSecret, setClientSecret] = useState<string|null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggleAmenity = (a: string) => setAmenities(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev,a]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First create submission
      const res = await api.post('/submissions', {
        ownerEmail: JSON.parse(localStorage.getItem('user') || '{}')?.email || 'unknown@owner',
        name, region, description, pricePerNight: price,
        phoneNumber,
        imageUrlsJson: '[]', amenitiesJson: JSON.stringify(amenities), address, latitude: lat? Number(lat): null, longitude: lng? Number(lng): null
      });
      const submission = res.data;
      setSubmissionId(submission.id);
      // Upload images if any
      if (files && submission.id) {
        const form = new FormData();
        Array.from(files).forEach(f => form.append('files', f));
        await api.post(`/submissions/${submission.id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      // Move to payment step
      setStep('payment');
      // Fetch Stripe publishable key
      const key = await fetchPublishableKey();
      setStripePromise(loadStripe(key));
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Submission failed.';
      push(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStart = async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const { clientSecret } = await createVillaListingPayment(submissionId, promoted);
      setClientSecret(clientSecret);
    } catch (e: any) {
      push('Failed to start payment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('done');
    push('Submitted! We will review your property shortly.', 'success');
    setName(''); setRegion(''); setDescription(''); setPrice(0); setAmenities([]); setAddress(''); setLat(''); setLng(''); setFiles(null);
    setSubmissionId(null); setPromoted(false); setClientSecret(null); setStripePromise(null);
  };

  return (
    <div className="max-w-2xl mx-auto card p-6">
      <h1 className="text-2xl font-semibold mb-4">List your property</h1>
      {step === 'form' && (
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="input" placeholder="Region" value={region} onChange={e=>setRegion(e.target.value)} required />
          <textarea className="input" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <input className="input" placeholder="Owner phone number" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} required />
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
          <input className="input" type="file" multiple onChange={e=>setFiles(e.target.files)} />
          <button className="bg-accent-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Submitting...' : 'Continue to Payment'}</button>
        </form>
      )}
      {step === 'payment' && (
        <div className="space-y-4">
          <div className="mb-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={promoted} onChange={e=>setPromoted(e.target.checked)} />
              <span>Promote this listing (show first): <span className="font-semibold">€7</span></span>
            </label>
            <div className="text-sm text-gray-500 ml-6">Regular listing: <span className="font-semibold">€3</span></div>
          </div>
          {!clientSecret ? (
            <button className="bg-accent-600 text-white px-4 py-2 rounded" onClick={handlePaymentStart} disabled={loading}>
              {loading ? 'Preparing payment...' : `Pay €${promoted ? 7 : 3} to list`}
            </button>
          ) : (
            stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} amount={promoted ? 7 : 3} promoted={promoted} />
              </Elements>
            )
          )}
        </div>
      )}
      {step === 'done' && (
        <div className="text-green-700 text-lg font-semibold">Thank you! Your property was submitted and is pending review.</div>
      )}
    </div>
  );
};

export default SubmitProperty;


