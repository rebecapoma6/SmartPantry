import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const PublicRoute = () => {
  const { isAuthenticated, sessionUser } = useAuthStore();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  // Si es el Súper Admin, lo mandamos a gestionar las familias
  if (sessionUser?.role === 'AdminGeneral') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/inventario" replace />;
};

export default PublicRoute;
