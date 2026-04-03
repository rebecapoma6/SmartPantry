import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore"; // Ajusta la ruta a tu store
import { Bell, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Ajusta esta ruta según dónde tengas tu repositorio en el proyecto
import { createUserRepository } from "../database/repositories"; 

export default function Navbar() {
  const { isAuthenticated, isAdmin, clearSession } = useAuthStore();
  const userRepository = createUserRepository();
  const navigate = useNavigate();

  // Más adelante, este número vendrá de calcular las fechas en tu base de datos
  const alertasPendientes = 2; 

  const handleLogout = async () => {
    const { error } = await userRepository.cerrarSesion();
    if (!error) {
      clearSession();
      navigate('/');
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b shadow-sm fixed top-0 left-0 w-full z-50">
      {/* Lado Izquierdo: Logo y Enlaces Principales */}
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-green-700">
          SmartPantry
        </Link>

        {/* Muestra enlaces solo si el usuario está logueado */}
        {isAuthenticated && (
          <div className="hidden md:flex gap-4 text-sm font-medium text-gray-600">
            <Link to="/inventario" className="hover:text-green-600">Mi Despensa</Link>
            <Link to="/estadisticas" className="hover:text-green-600">Estadísticas</Link>
          </div>
        )}
      </div>

      {/* Lado Derecho: Acciones de Sesión o Notificaciones */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Si es Admin (Gestor), mostramos un botón especial */}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                  <ShieldAlert className="w-4 h-4" />
                  Panel Gestor
                </Button>
              </Link>
            )}

            {/* Campana de Notificaciones (Semáforo Inteligente) */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none">
                <Bell className="h-6 w-6 text-gray-600" />
                {alertasPendientes > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full"
                  >
                    {alertasPendientes}
                  </Badge>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Alertas de Caducidad</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {alertasPendientes > 0 ? (
                  <>
                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                      Leche Gloria - Vence en 2 días
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="text-gray-500">
                    Tu despensa está al día.
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón de Cerrar Sesión */}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-5 w-5 text-gray-600 hover:text-red-600" />
            </Button>
          </>
        ) : (
          /* Botones para usuarios NO logueados */
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/registro">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Registrarse
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}