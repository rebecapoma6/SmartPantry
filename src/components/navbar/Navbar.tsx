import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore"; // Ajusta la ruta a tu store
import { Bell, LogOut, ShieldAlert, UserCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "../../image/sinfondosmartpantry.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createUserRepository } from "../../database/repositories"; 

export default function Navbar() {
  const { isAuthenticated, clearSession,sessionUser } = useAuthStore();
  const userRepository = createUserRepository();
  const navigate = useNavigate();
  const alertasPendientes = 2; //luego lo uso

  const avatar = sessionUser?.profile?.avatar_url;
  const nombre = sessionUser?.profile?.nombre?.split(' ')[0] || 'Usuario';
  const rol = sessionUser?.role;

  const handleLogout = async () => {
    const { error } = await userRepository.cerrarSesion();
    if (!error) {
      clearSession();
      navigate('/');
    }
  };

  return (
<nav className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="flex items-center gap-6">
        <Link to="/">
           <img 
                  src={logo} 
                  alt="logo empresa" 
                  className="h-16 w-auto object-contain"
                />
        </Link>

        {/* 2. MENÚ INTELIGENTE SEGÚN EL ROL */}
        {isAuthenticated && (
          <div className="hidden md:flex gap-4 text-sm font-medium text-gray-600 items-center">
            
            {/* Si es el Súper Admin, ve esto: */}
            {rol === 'AdminGeneral' ? (
              <Link to="/admin" className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800">
                <ShieldAlert className="w-4 h-4" />
                Gestión de Familias
              </Link>
            ) : (
              /* Si es AdminUser o Usuario, ven esto: */
              <>
                <Link to="/inventario" className="hover:text-green-600">Mi Despensa</Link>
                <Link to="/estadisticas" className="hover:text-green-600">Estadísticas</Link>
                
                {/* Botón extra EXCLUSIVO para el jefe de la casa */}
                {rol === 'AdminUser' && (
                  <Link to="/mi-familia" className="flex items-center gap-1 text-green-700 font-medium hover:text-green-900 ml-2">
                    <Users className="w-4 h-4" />
                    Mi Familia
                  </Link>
                )}
              </>
            )}
            
          </div>
        )}
      </div>

      {/* Lado Derecho: Acciones de Sesión o Notificaciones */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
         <>
            {/* 3. Etiqueta visual para saber quién es quién */}
            <Badge className="hidden md:flex bg-gray-50 text-gray-500 border-gray-200">
                {rol === 'AdminGeneral' ? 'Súper Admin' : rol === 'AdminUser' ? 'Admin Usuario' : 'Miembro'}
            </Badge>
           

            <div className="flex items-center gap-2">
              
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={`Avatar de ${nombre}`} 
                  className="h-7 w-7 rounded-full object-cover border border-gray-200" 
                />
              ) : (
                <UserCircle className="h-7 w-7 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Hola, {nombre}
              </span>
              
            </div>
            

            {/* Ocultamos la campana si es Súper Admin (él no tiene productos que caduquen) */}
            {rol !== 'AdminGeneral' && (
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
            )}

            {/* Botón de Cerrar Sesión */}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-5 w-5 text-gray-600 hover:text-red-600" />
            </Button>
          </>
        ) : (
          /* Botones para usuarios NO logueados */
          <div className="flex items-center gap-2">
            <Link to="/iniciarSesion">
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