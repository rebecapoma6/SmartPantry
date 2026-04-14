import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // si no está logueado, lo mandamos al login
  if (!isAuthenticated) return <Navigate to="/iniciarSesion" replace />;
  
  // si está logueado pero NO es admin (osea es un usuario Usuario), lo mandamos a su inventario
  if (!isAdmin) return <Navigate to="/inventario" replace />;

  // si pasa ambos filtros (es admin y está logueado), le mostramos la ruta
  return <Outlet />;
}