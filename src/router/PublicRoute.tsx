import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to={isAdmin ? "/vistaAdmin" : "/products"} replace />;
};

export default PublicRoute;
