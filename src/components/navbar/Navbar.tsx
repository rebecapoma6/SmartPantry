import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore"; // Ajusta la ruta a tu store
import { Bell, LogOut, Menu, ShieldAlert, UserCircle, Users, X } from "lucide-react";
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
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, clearSession, sessionUser } = useAuthStore();
  const userRepository = createUserRepository();
  const navigate = useNavigate();
  const alertasPendientes = 2; //luego lo uso
  const [menuAbierto, setMenuAbierto] = useState(false);

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

  // Función para cerrar el menú al hacer clic en un link del celular
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Lado Izquierdo: Logo y Enlaces de Escritorio */}
        <div className="flex items-center gap-6">
          <Link to="/" onClick={cerrarMenu}>
            <img
              src={logo}
              alt="logo empresa"
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* MENÚ DE ESCRITORIO (Se oculta en celulares con "hidden md:flex") */}
          {isAuthenticated && (
            <div className="hidden md:flex gap-4 text-sm font-medium text-gray-600 items-center">
              {rol === 'AdminGeneral' ? (
                <>
                  <Link to="/admin" className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800">
                    <ShieldAlert className="w-4 h-4" /> DashBoard SmarthPantry
                  </Link>
                  <Link to="/tablas-superAdmin" className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800">
                    <ShieldAlert className="w-4 h-4" /> Gestión de Familias
                  </Link>
                  <Link to="/perfil-superAdmin" className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800">
                    <ShieldAlert className="w-4 h-4" /> Perfil Super Administrador
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/inventario" className="hover:text-green-600">Mi Despensa</Link>
                  <Link to="/estadisticas" className="hover:text-green-600">Estadísticas</Link>
                  {rol === 'AdminUser' && (
                    <Link to="/perfil" className="flex items-center gap-1 text-green-700 font-medium hover:text-green-900 ml-2">
                      <Users className="w-4 h-4" /> Mi Familia
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Lado Derecho: Acciones y Botón Hamburguesa */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
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

              {rol !== 'AdminGeneral' && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none">
                    <Bell className="h-6 w-6 text-gray-600" />
                    {alertasPendientes > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full">
                        {alertasPendientes}
                      </Badge>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Alertas de Caducidad</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {alertasPendientes > 0 ? (
                      <DropdownMenuItem className="text-red-600 cursor-pointer">
                        Leche Gloria - Vence en 2 días
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-gray-500">
                        Tu despensa está al día.
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión" className="hidden md:flex">
                <LogOut className="h-5 w-5 text-gray-600 hover:text-red-600" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/iniciarSesion">
                <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50">Iniciar sesión</Button>
              </Link>
              <Link to="/registro">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Registrarse</Button>
              </Link>
            </div>
          )}

          {/* 🔥 4. BOTÓN HAMBURGUESA (Visible solo en móviles) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-1"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <X className="h-6 w-6 text-gray-800" /> : <Menu className="h-6 w-6 text-gray-800" />}
          </Button>
        </div>
      </div>

      {/* 🔥 5. MENÚ MÓVIL DESPLEGABLE */}
      {menuAbierto && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg flex flex-col py-4 px-6 gap-4 z-50">
          {isAuthenticated ? (
            <>
              {rol === 'AdminGeneral' ? (
                <>
                  <Link to="/admin" onClick={cerrarMenu} className="flex items-center gap-2 text-blue-600 font-semibold py-2">
                    <ShieldAlert className="w-5 h-5" /> DashBoard SmarthPantry
                  </Link>
                  <Link to="/tablas-superAdmin" onClick={cerrarMenu} className="flex items-center gap-2 text-blue-600 font-semibold py-2">
                    <ShieldAlert className="w-5 h-5" /> Gestión de Familias
                  </Link>
                  <Link to="/perfil-superAdmin" onClick={cerrarMenu} className="flex items-center gap-2 text-blue-600 font-semibold py-2">
                    <ShieldAlert className="w-5 h-5" /> Perfil Super Administrador
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/inventario" onClick={cerrarMenu} className="py-2 text-gray-700 font-medium hover:text-green-600">Mi Despensa</Link>
                  <Link to="/estadisticas" onClick={cerrarMenu} className="py-2 text-gray-700 font-medium hover:text-green-600">Estadísticas</Link>
                  {rol === 'AdminUser' && (
                    <Link to="/perfil" onClick={cerrarMenu} className="flex items-center gap-2 text-green-700 font-medium py-2">
                      <Users className="w-5 h-5" /> Mi Familia
                    </Link>
                  )}
                </>
              )}

              <div className="h-px bg-gray-100 my-2"></div>

              <button
                onClick={() => { cerrarMenu(); handleLogout(); }}
                className="flex items-center gap-2 text-red-600 font-medium py-2 text-left"
              >
                <LogOut className="h-5 w-5" /> Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/iniciarSesion" onClick={cerrarMenu}>
                <Button variant="outline" className="w-full justify-center">Iniciar sesión</Button>
              </Link>
              <Link to="/registro" onClick={cerrarMenu}>
                <Button className="w-full bg-green-600 text-white justify-center hover:bg-green-700">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}