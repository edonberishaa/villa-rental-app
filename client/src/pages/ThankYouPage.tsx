// pages/ThankYouPage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    reservationCode: string;
    feeAmount: number;
    totalNights: number;
    guestName: string;
  };

  if (!state) {
    // Redirect back if no booking info
    navigate("/");
    return null;
  }

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 shadow rounded text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You, {state.guestName}!</h2>
      <p className="text-lg mb-2">🎉 Your reservation was successful.</p>
      <p><strong>Reservation Code:</strong> {state.reservationCode}</p>
      <p><strong>Total Nights:</strong> {state.totalNights}</p>
      <p><strong>Fee Paid:</strong> ${state.feeAmount}</p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go to Home
      </button>
    </div>
  );
};

export default ThankYouPage;
