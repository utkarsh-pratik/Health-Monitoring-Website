import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based redirection
  const isDoctorRoute = location.pathname.startsWith("/doctor");
  const isPatientRoute = location.pathname.startsWith("/patient");

  if (isDoctorRoute && user.role !== "doctor") return <Navigate to="/" replace />;
  if (isPatientRoute && user.role !== "patient") return <Navigate to="/" replace />;

  return <Outlet />;
}
