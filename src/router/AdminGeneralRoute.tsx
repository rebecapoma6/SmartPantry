import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function AdminGeneralRoute() {
  const { isAuthenticated, sessionUser } = useAuthStore();
  // si no está logueado, lo mandamos al login
  if (!isAuthenticated) return <Navigate to="/iniciarSesion" replace />;

  // Si está logueado pero NO es el Súper Admin, lo mandamos a su despensa
  if (sessionUser?.role !== 'AdminGeneral') return <Navigate to="/inventario" replace />;

  // si pasa ambos filtros (es admin y está logueado), le mostramos la ruta
  return <Outlet />;
}