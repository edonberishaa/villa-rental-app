// src/routes/AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import VillaDetailsPage from "../pages/VillaDetailsPage";
import ReservationsPage from "../pages/ReservationsPage";
import ThankYouPage from "../pages/ThankYouPage"; 
import ReservationPage from "../pages/ReservationsPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/villa/:villaId" element={<VillaDetailsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
        <Route path="/reserve/:villaId" element={<ReservationPage />} />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
