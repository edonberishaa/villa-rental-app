import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllVillas, getVillaById } from "../services/villaService";
import type { Villa } from "../types/Villa";
import { createReservation } from "../services/reservationService";
import { useToast } from "../components/Toast";
import { differenceInCalendarDays } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {loadStripe} from '@stripe/stripe-js';
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import { fetchPublishableKey } from "../services/api";

interface ReservationPayload {
  villaId: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestsCount: number;
  startDate: string;
  endDate: string;
}

let stripePromise: Promise<any> | null = null;
async function getStripe() {
  if (!stripePromise) {
    const key = await fetchPublishableKey();
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

const CheckoutForm: React.FC<{ onSuccess: (data: any)=>void }>= ({onSuccess}) =>{
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const handlePay = async (e: React.FormEvent) =>{
    e.preventDefault();
    if(!stripe || !elements) return;
    setLoading(true);
    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thankyou`,
      },
      redirect: 'if_required'
    });
    setLoading(false);
    if(error){
      alert(error.message);
    } else {
      onSuccess({});
    }
  };
  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      <button disabled={loading || !stripe || !elements} className="bg-accent-600 text-white px-4 py-2 rounded">
        {loading ? 'Processing...' : 'Pay now'}
      </button>
    </form>
  );
};

const ReservationPage: React.FC = () => {
  const { villaId } = useParams<{ villaId: string }>();
  const navigate = useNavigate();

  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVillaId, setSelectedVillaId] = useState<number | null>(null);
  const [villaPrice, setVillaPrice] = useState<number>(0);

  const { user } = useAuth();
  const [form, setForm] = useState<Omit<ReservationPayload, "villaId">>({
    guestName: user?.fullName || "",
    guestPhone: "",
    guestEmail: user?.email || "",
    guestsCount: 1,
    startDate: "",
    endDate: "",
  });
  // Update form fields if user changes (e.g., login/logout)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      guestName: user?.fullName || "",
      guestEmail: user?.email || "",
    }));
  }, [user]);

  const [totalNights, setTotalNights] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Load all villas on mount
  useEffect(() => {
    getAllVillas()
      .then(setVillas)
      .catch(console.error);
  }, []);

  // If villaId is present in URL, select it automatically
  useEffect(() => {
    if (villaId) {
      const id = Number(villaId);
      if (!isNaN(id)) {
        setSelectedVillaId(id);
      }
    }
  }, [villaId]);

  // Fetch price when selectedVillaId changes
  useEffect(() => {
    if (selectedVillaId) {
      getVillaById(selectedVillaId)
        .then((villa) => {
          setVillaPrice(villa.pricePerNight);
        })
        .catch(console.error);
    } else {
      setVillaPrice(0);
    }
  }, [selectedVillaId]);

  // Calculate nights and total cost
  useEffect(() => {
    if (form.startDate && form.endDate && villaPrice > 0) {
      const nights = differenceInCalendarDays(
        new Date(form.endDate),
        new Date(form.startDate)
      );
      if (nights > 0) {
        setTotalNights(nights);
        setTotalCost(nights * villaPrice);
      } else {
        setTotalNights(0);
        setTotalCost(0);
      }
    } else {
      setTotalNights(0);
      setTotalCost(0);
    }
  }, [form.startDate, form.endDate, villaPrice]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "guestsCount" ? parseInt(value) : value,
    }));
  };

  const { push } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVillaId) {
      push("Please select a villa.", "error");
      return;
    }

    const payload: ReservationPayload = {
      villaId: selectedVillaId,
      ...form,
    };

    try {
      const res = await createReservation(payload);
      const { clientSecret } = res as any;
      if(!clientSecret){
        push('Payment initialization failed.', 'error');
        return;
      }
      const stripe = await getStripe();
      if(!stripe){ push('Stripe failed to load', 'error'); return; }
      // Render Elements inline in a modal-like section
      setShowPayment(true);
      setPaymentOptions({clientSecret, appearance:{theme:'flat'}});
    } catch (error: any) {
      const msg = error.response?.data?.message || "Reservation failed.";
      push(msg, 'error');
    }
  };

  const [showPayment, setShowPayment] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<any>(null);

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-800 p-8 rounded shadow-soft mt-6">
      <h2 className="text-2xl font-semibold mb-6">Book a Villa</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Villa selection dropdown disabled if villaId comes from URL */}
        <select
          required
          value={selectedVillaId ?? ""}
          onChange={(e) => setSelectedVillaId(parseInt(e.target.value))}
          className="w-full border p-2"
          disabled={Boolean(villaId)} // disable if villaId is fixed from URL
        >
          <option value="">Select a Villa</option>
          {villas.map((villa) => (
            <option key={villa.id} value={villa.id}>
              {villa.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="guestName"
          placeholder="Full Name"
          onChange={handleChange}
          value={form.guestName}
          required
          className="w-full border p-2"
          readOnly={!!user}
        />
        <input
          type="text"
          name="guestPhone"
          placeholder="Phone Number"
          onChange={handleChange}
          value={form.guestPhone}
          required
          className="w-full border p-2"
        />
        <input
          type="email"
          name="guestEmail"
          placeholder="Email (optional)"
          onChange={handleChange}
          value={form.guestEmail}
          className="w-full border p-2"
          readOnly={!!user}
        />
        <input
          type="number"
          name="guestsCount"
          placeholder="Guests Count"
          onChange={handleChange}
          value={form.guestsCount}
          required
          min={1}
          className="w-full border p-2"
        />
        <input
          type="date"
          name="startDate"
          onChange={handleChange}
          value={form.startDate}
          required
          className="w-full border p-2"
        />
        <input
          type="date"
          name="endDate"
          onChange={handleChange}
          value={form.endDate}
          required
          className="w-full border p-2"
        />

        {villaPrice > 0 && totalNights > 0 && (
          <div className="bg-gray-100 p-4 rounded text-sm text-gray-700">
            <p>
              <strong>Price Per Night:</strong> €{villaPrice}
            </p>
            <p>
              <strong>Total Nights:</strong> {totalNights}
            </p>
            <p>
              <strong>Total Cost:</strong> €{totalCost}
            </p>
          </div>
        )}

        <button type="submit" className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-600/90">Continue to Payment</button>
      </form>
      {showPayment && paymentOptions?.clientSecret && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Payment</h3>
          <Elements stripe={stripePromise} options={paymentOptions}>
            <CheckoutForm onSuccess={() => navigate("/thankyou", { state: { reservationCode: 'Pending via webhook', feeAmount: totalCost * 0.2, totalNights, guestName: form.guestName } })} />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
