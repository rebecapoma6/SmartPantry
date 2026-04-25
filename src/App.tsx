import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Layouts (Aquí adentro es donde irá tu Navbar)
// import LandingLayout from './layouts/LandingLayout';
// import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import AuthLayout from "./layouts/AuthLayout";
// Guardias de Seguridad (Tus escudos)
import ProtectedRoute from "./router/ProtectedRoute";
import PublicRoute from "./router/PublicRoute";
import AdminGeneralRoute from "./router/AdminGeneralRoute";



import RegistroPage from "./pages/RegistroPage";
import LandingLayout from "./layouts/LandingLayout";
import HomePage from "./pages/HomePage";
import InventarioPage from "./pages/InventarioPage";
import IniciarSesionPage from "./pages/IniciarSesionPage";
import AdminGeneralPage from "./pages/AdminGeneralPage";



// // Tus Páginas Reales

// import IniciarSesionPage from './pages/IniciarSesionPage';
// import RegistroPage from './pages/RegistroPage';
// import InventarioPage from './pages/InventarioPage'; // Antes era ProductosSupabase
// import PerfilUsuarioPage from './pages/PerfilUsuarioPage'; 
// import AdminPage from "./pages/AdminPage";
// import EstadisticasPage from "./pages/EstadisticasPage";

const router = createBrowserRouter([
  // 1. RUTA PÚBLICA GENERAL (Landing Page)
  {
    element: <LandingLayout />, 
    children: [
      { path: "/", element: <HomePage /> },
    ],
  },

  {
    element: <PublicRoute />, 
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/iniciarSesion", element: <IniciarSesionPage/> },
          { path: "/registro", element: <RegistroPage/> },
        ]
      }
    ]
  },

  // 3. RUTAS PROTEGIDAS (Para cualquier usuario logueado)
  {
    element: <ProtectedRoute />, 
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/inventario", element: <InventarioPage/> },
          // { path: "/estadisticas", element: <EstadisticasPage/> },
          // { path: "/perfil", element: <PerfilUsuarioPage/>} 
        ]
      }
    ]
  },

  // 4. RUTAS VIP (Solo para el Gestor / Admin)
  {
    element: <AdminGeneralRoute />, 
    children: [
      {
        element: <AppLayout />, 
        children: [
          { path: "/admin", element: <AdminGeneralPage/>}
        ]
      }
    ]
  }
]);

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}