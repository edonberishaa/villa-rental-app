import React, { useEffect, useState } from "react";
import { getAllVillas, getVillaById } from "../services/villaService";
import type { Villa } from "../types/Villa";
import { createReservation } from "../services/reservationService";
import { differenceInCalendarDays } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

interface ReservationPayload {
  villaId: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestsCount: number;
  startDate: string;
  endDate: string;
}

const ReservationPage: React.FC = () => {
  const { villaId } = useParams<{ villaId: string }>();
  const navigate = useNavigate();

  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVillaId, setSelectedVillaId] = useState<number | null>(null);
  const [villaPrice, setVillaPrice] = useState<number>(0);

  const [form, setForm] = useState<Omit<ReservationPayload, "villaId">>({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    guestsCount: 1,
    startDate: "",
    endDate: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVillaId) {
      alert("Please select a villa.");
      return;
    }

    const payload: ReservationPayload = {
      villaId: selectedVillaId,
      ...form,
    };

    try {
      const res = await createReservation(payload);
      navigate("/thankyou", {
        state: {
          reservationCode: res.reservationCode,
          feeAmount: res.feeAmount,
          totalNights,
          guestName: form.guestName,
          villaName: villas.find((v) => v.id === selectedVillaId)?.name,
        },
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Reservation failed.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow mt-6">
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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Book Now
        </button>
      </form>
    </div>
  );
};

export default ReservationPage;
