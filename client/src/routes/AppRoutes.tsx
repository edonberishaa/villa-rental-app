// src/routes/AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import VillaDetailsPage from "../pages/VillaDetailsPage";
import ReservationsPage from "../pages/ReservationsPage";
import ThankYouPage from "../pages/ThankYouPage"; 
import ReservationPage from "../pages/ReservationsPage";
import Layout from "../components/Layout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AdminDashboard from "../pages/AdminDashboard";
import AdminReservations from "../pages/AdminReservations";
import SubmitProperty from "../pages/SubmitProperty";
import AdminSubmissions from "../pages/AdminSubmissions";
import OwnerDashboard from "../pages/OwnerDashboard";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

type ElementChild = React.ReactElement | null;
const RequireAuth: React.FC<{ children: ElementChild }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <LoginPage />;
  }
  return children;
};

const RequireAdmin: React.FC<{ children: ElementChild }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (!(user.roles?.includes('Admin'))) return <Home />;
  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/villa/:villaId" element={<VillaDetailsPage />} />
            <Route path="/reservations" element={<RequireAuth><ReservationsPage /></RequireAuth>} />
            <Route path="/thankyou" element={<ThankYouPage />} />
            <Route path="/reserve/:villaId" element={<RequireAuth><ReservationPage /></RequireAuth>} />
            <Route path="/submit" element={<RequireAuth><SubmitProperty /></RequireAuth>} />
            <Route path="/owner" element={<RequireAuth><OwnerDashboard /></RequireAuth>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/reservations" element={<RequireAdmin><AdminReservations /></RequireAdmin>} />
            <Route path="/admin/submissions" element={<RequireAdmin><AdminSubmissions /></RequireAdmin>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
