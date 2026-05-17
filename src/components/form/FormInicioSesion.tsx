import { createUserRepository } from "@/database/repositories";
import { useAuthStore } from "@/stores/useAuthStore";
import { validacionesRegistro } from "@/utils/validacionesRegistro";
import { useState, type ChangeEvent, type FocusEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AppRole } from "@/interfaces/Profile";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { KeyRound, Mail } from "lucide-react";

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

  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

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


  const handleRecuperarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setIsResetting(true);
   const { error } = await userRepository.resetPasswordForEmail(resetEmail);

    if (error) {
      toast.error("Hubo un error al enviar el enlace.");
    } else {
      toast.success("¡Enlace enviado! Revisa tu correo.");
      setModalAbierto(false);
      setResetEmail("");
    }
    setIsResetting(false);
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
          role: (role as AppRole) || 'Usuario' // Si no tiene, le ponemos Usuario por defecto
        };

        setSession(sessionData);

        const nombreUsuario = result.data.profile?.nombre || 'a SmartPantry';
        toast.success(`¡Bienvenido ${nombreUsuario}!`);
        if (role === 'AdminGeneral') {
          navigate('/admin');
        } else {
          navigate('/inventario');
        }
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto mb-8 p-6 bg-background rounded-xl shadow-sm border mt-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">Iniciar Sesión</h2>
        <p className="text-sm text-muted-foreground">Ingresa a tu despensa inteligente</p>
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
        {/* 🔥 Aquí quitamos el Link antiguo, solo dejamos el Label limpio */}
        <Label htmlFor="password">Contraseña</Label>
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

      {/* 🔥 Y aquí se queda tu Popup moderno */}
      <div className="flex justify-end mt-1">
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogTrigger asChild>
            <button type="button" className="text-sm text-green-600 hover:text-green-800 font-medium hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
                <KeyRound className="w-5 h-5 text-green-600" />
                Recuperar Contraseña
              </DialogTitle>
              <DialogDescription>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu clave.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecuperarPassword} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="pl-9"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <DialogFooter className="sm:justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isResetting}>
                  {isResetting ? "Enviando..." : "Enviar Enlace"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-4" disabled={cargando}>
        {cargando ? "Ingresando..." : "Ingresar"}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro" className="text-green-600 font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </form>
  );
}