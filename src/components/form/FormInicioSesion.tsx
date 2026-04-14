import { createUserRepository } from "@/database/repositories";
import { useAuthStore } from "@/stores/useAuthStore";
import { validacionesRegistro } from "@/utils/validacionesRegistro";
import { useState, type ChangeEvent, type FocusEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormInicioProps {
  email: string;
  password: string;
}

interface ErrorsProps {
  email: string;
  password: string;
}


export default function FormInicioSesion() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const userRepository = createUserRepository();

  const [cargando, setCargando] = useState(false);
  const [formInicio, setFormInicio] = useState<FormInicioProps>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<ErrorsProps>({
    email: '',
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormInicio({ ...formInicio, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validacionesRegistro(name, value, formInicio.password);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: validacionesRegistro('email', formInicio.email),
      password: validacionesRegistro('password', formInicio.password),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    setCargando(true);

    try {
      const result = await userRepository.iniciarSesion(formInicio.email, formInicio.password);

      if (result.error) {
        toast.error('Credenciales inválidas');
      } else if (result.data) {
        const supabaseUser = result.data.user;

        if (!supabaseUser) {
          toast.error('Ocurrió un error al cargar el usuario');
          return;
        }

        await setSession(result.data);
        const { data: role } = result.data.profile?.id
          ? await userRepository.obtenerRolUsuario(result.data.profile.id)
          : { data: null };

        const sessionData = {
          user: supabaseUser,
          profile: result.data.profile,
          role: role || 'Usuario' // Si no tiene, le ponemos Usuario por defecto
        };

        setSession(sessionData);

        toast.success(`¡Bienvenido ${result.data.profile?.full_name}!`);
        navigate(role === 'Admin' ? '/admin' : '/inventario');
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto mb-8 p-6 bg-white rounded-xl shadow-sm border mt-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">Iniciar Sesión</h2>
        <p className="text-sm text-gray-500">Ingresa a tu despensa inteligente</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          value={formInicio.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? "border-red-500" : ""}
          disabled={cargando}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Contraseña</Label>
          <Link to="/recuperarPass" className="text-xs text-green-600 hover:text-green-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={formInicio.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.password ? "border-red-500" : ""}
          disabled={cargando}
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-4" disabled={cargando}>
        {cargando ? "Ingresando..." : "Ingresar"}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro" className="text-green-600 font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </form>
  );

}