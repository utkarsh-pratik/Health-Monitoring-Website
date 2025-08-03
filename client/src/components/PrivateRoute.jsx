import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  if (!currentUser) return <Navigate to="/sign-in" replace />;

  // Role-based redirection
  const isDoctorRoute = location.pathname.startsWith("/doctor");
  const isPatientRoute = location.pathname.startsWith("/patient");

  if (isDoctorRoute && currentUser.role !== "doctor") return <Navigate to="/unauthorized" />;
  if (isPatientRoute && currentUser.role !== "patient") return <Navigate to="/unauthorized" />;

  return <Outlet />;
}
