import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, ShieldAlert, UserCircle, Users, X, AlertTriangle, Clock, ShoppingCart } from "lucide-react";
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import { createUserRepository } from "@/database/repositories";
import { BotonTema } from "../home/BotonTema";

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const sessionUser = useAuthStore((state) => state.sessionUser);

  const ticketAlertas = useAuthStore((state) => state.ticketAlertas);

  const userRepository = createUserRepository();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [alertas, setAlertas] = useState<any[]>([]);

  const avatar = sessionUser?.profile?.avatar_url;
  const nombre = sessionUser?.profile?.nombre?.split(' ')[0] || 'Usuario';
  const rol = sessionUser?.role;

  useEffect(() => {
    if (isAuthenticated && sessionUser && rol !== 'AdminGeneral') {
      cargarAlertas();
    }
  }, [isAuthenticated, sessionUser, ticketAlertas]);

  const cargarAlertas = async () => {
    try {
      const miFamiliaId = sessionUser?.profile?.familia_id;

      let query = supabase.from('productos').select('id, nombre, cantidad, stock_minimo, fecha_caducidad');

      if (miFamiliaId) {
        query = query.eq('familia_id', miFamiliaId);
      } else if (sessionUser?.profile?.id) {
        query = query.eq('agregado_por', sessionUser.profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const nuevasAlertas: any[] = [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        data.forEach(prod => {
          if (prod.cantidad < prod.stock_minimo) {
            nuevasAlertas.push({
              id: `stock-${prod.id}`,
              tipo: 'stock',
              mensaje: `${prod.nombre} - Falta stock`,
              icono: <ShoppingCart className="w-4 h-4 text-amber-500 mr-2 shrink-0" />,
              colorText: 'text-amber-700'
            });
          }

          if (prod.fecha_caducidad) {
            const fechaCad = new Date(prod.fecha_caducidad);
            fechaCad.setHours(0, 0, 0, 0);
            const diffTime = fechaCad.getTime() - hoy.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
              nuevasAlertas.push({
                id: `cad-${prod.id}`,
                tipo: 'caducado',
                mensaje: `${prod.nombre} - ¡Caducado!`,
                icono: <AlertTriangle className="w-4 h-4 text-red-600 mr-2 shrink-0" />,
                colorText: 'text-red-600 font-bold'
              });
            } else if (diffDays === 0) {
              nuevasAlertas.push({
                id: `cad-${prod.id}`,
                tipo: 'por_caducar',
                mensaje: `${prod.nombre} - Vence HOY`,
                icono: <Clock className="w-4 h-4 text-rose-500 mr-2 shrink-0" />,
                colorText: 'text-rose-600 font-bold'
              });
            }
            else if (diffDays <= 5) {
              nuevasAlertas.push({
                id: `cad-${prod.id}`,
                tipo: 'por_caducar',
                mensaje: `${prod.nombre} - Vence en ${diffDays} día(s)`,
                icono: <Clock className="w-4 h-4 text-orange-500 mr-2 shrink-0" />,
                colorText: 'text-orange-600'
              });
            }
          }
        });

        setAlertas(nuevasAlertas);
      }
    } catch (error) {
      console.error("Error al cargar alertas:", error);
    }
  };

  const alertasPendientes = alertas.length;

  const handleLogout = async () => {
    const { error } = await userRepository.cerrarSesion();
    if (!error) {
      clearSession();
      navigate('/');
    }
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background border-b shadow-sm">
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

          {/* MENÚ DE ESCRITORIO */}
          {isAuthenticated && (
            <div className="hidden md:flex gap-4 text-sm font-medium text-muted-foreground items-center">
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
                  <Link to="/perfil" className="flex items-center gap-1 text-green-700 font-medium hover:text-green-900 ml-2">
                    <Users className="w-4 h-4" /> Mi Familia
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Lado Derecho: Acciones y Botón Hamburguesa */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Badge className="hidden md:flex bg-muted text-muted-foreground border-border">
                {rol === 'AdminGeneral' ? 'Súper Admin' : rol === 'AdminUser' ? 'Admin Usuario' : 'Miembro'}
              </Badge>

              <div className="flex items-center gap-2">
                {avatar ? (
                  <img
                    key={avatar}
                    src={avatar}
                    alt={`Avatar de ${nombre}`}
                    className="h-7 w-7 rounded-full object-cover border border-border"
                  />
                ) : (
                  <UserCircle className="h-7 w-7 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Hola, {nombre}
                </span>
              </div>

              {/* MENU DESPLEGABLE DE ALERTAS DINÁMICO */}
              {rol !== 'AdminGeneral' && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-muted transition-colors focus:outline-none">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                    {alertasPendientes > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] rounded-full border-white border-2">
                        {alertasPendientes}
                      </Badge>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 max-h-[70vh] overflow-y-auto">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Notificaciones de Despensa</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {alertasPendientes > 0 ? (
                        alertas.map((alerta) => (
                          <DropdownMenuItem key={alerta.id} className={`flex items-center py-2 ${alerta.colorText}`}>
                            {alerta.icono}
                            <span className="truncate">{alerta.mensaje}</span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem className="text-muted-foreground py-4 text-center justify-center">
                          Tu despensa está al día.
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión" className="hidden md:flex">
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-red-600" />
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
          <BotonTema/>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-1"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </Button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuAbierto && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-t border-gray-100 shadow-lg flex flex-col py-4 px-6 gap-4 z-50">
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
                  <Link to="/perfil" onClick={cerrarMenu} className="flex items-center gap-2 text-green-700 font-medium py-2">
                    <Users className="w-5 h-5" /> Mi Familia
                  </Link>
                </>
              )}

              <div className="h-px bg-muted my-2"></div>

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