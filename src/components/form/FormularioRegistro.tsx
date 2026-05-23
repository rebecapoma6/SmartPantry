import { useState, type ChangeEvent, type FocusEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validacionesRegistro } from '@/utils/validacionesRegistro';
import { Eye, EyeOff ,CheckCircle2 } from 'lucide-react'; 

import { createUserRepository } from '@/database/repositories';
import { useAuthStore } from '@/stores/useAuthStore';
import ImageInput from '../ui/ImageInput';
import type { RegisterData } from '@/interfaces/Profile';

interface FormDataProps {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar_file?: File | null;
  movil: string;
}

interface ErrorsProps {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  movil: string; 
}

export default function FormularioRegistro() {
  const [searchParams] = useSearchParams();
  const codigoInvitacion = searchParams.get("familia");

  const navigate = useNavigate();
  const userRepository = createUserRepository();
  const setSession = useAuthStore(state => state.setSession);
  
  const [formData, setFormData] = useState<FormDataProps>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar_file: null,
    movil: ''
  });

  const [errors, setErrors] = useState<ErrorsProps>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    movil: '' 
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);


  const campoValido = (campo: keyof ErrorsProps) => {
    return formData[campo] !== '' && errors[campo] === '';
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validacionesRegistro(name, value, formData.password);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileSelect = (file: File) => {
    setFormData(prev => ({ ...prev, avatar_file: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: ErrorsProps = {
      nombre: validacionesRegistro("nombre", formData.nombre),
      email: validacionesRegistro("email", formData.email),
      password: validacionesRegistro("password", formData.password),
      confirmPassword: validacionesRegistro("confirmPassword", formData.confirmPassword, formData.password),
      movil: validacionesRegistro("movil", formData.movil), 
    };

    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(Boolean);

    if (!hasErrors) {
      const newUser: RegisterData = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "Usuario",
        avatar_file: formData.avatar_file,
        movil: formData.movil,
        invite_familia_id: codigoInvitacion,
      };

      const toastId = toast.loading("Creando tu cuenta y guardando tu perfil...");

      try {
        const { data, error } = await userRepository.createUser(newUser);

        if (error) {
          let mensajeError = error.message;
          if (error.message.includes("User already registered") || error.message.includes("already exists")) {
            mensajeError = "Este correo ya está registrado en nuestra base de datos.";
          }
          toast.error(mensajeError, { id: toastId });
          return;
        }

        if (data) {
          setSession(data);
          toast.success(`¡Bienvenida a tu despensa, ${newUser.nombre}!`, { id: toastId });
          navigate('/inventario');
        }

      } catch (error) {
        toast.error("Ocurrió un error inesperado al conectar con la base de datos.", { id: toastId });
      }
    } else {
      toast.error('Corrige los errores del formulario antes de continuar.');
    }
  };

  return (
    <>
      {/* Aviso de Invitación */}
      {codigoInvitacion && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 text-sm text-center shadow-sm">
          <strong>¡Invitación detectada!</strong> Al registrarte te unirás directamente a la despensa de la familia.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto p-6 bg-background rounded-xl shadow-xl/30 border">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-green-700">Crear Cuenta</h2>
          <p className="text-sm text-muted-foreground">Únete a SmartPantry y organiza tu despensa</p>
        </div>

        <div className="flex justify-center mb-6">
          <ImageInput
            name="avatar"
            onFileSelect={handleFileSelect}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <div className="relative">
            <Input 
              name="nombre" 
              type="text" 
              placeholder="Ej. María Pérez" 
              value={formData.nombre} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`${errors.nombre ? "border-red-500 pr-10" : campoValido("nombre") ? "border-green-500 pr-10" : ""}`} 
            />
            {campoValido("nombre") && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />}
          </div>
          {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
        </div>

        {/* --- EMAIL --- */}
        <div className="space-y-1">
          <Label htmlFor="email">Correo Electrónico</Label>
          <div className="relative">
            <Input 
              name="email" 
              type="email" 
              placeholder="tu@correo.com" 
              value={formData.email} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`${errors.email ? "border-red-500 pr-10" : campoValido("email") ? "border-green-500 pr-10" : ""}`} 
            />
            {campoValido("email") && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />}
          </div>
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        {/* --- MÓVIL --- */}
        <div className="space-y-1">
          <Label htmlFor="movil">Móvil</Label>
          <div className="relative">
            <Input 
              name="movil" 
              type="tel" 
              placeholder="Ej. 600123456" 
              value={formData.movil}
              onChange={handleChange} 
              onBlur={handleBlur}
              className={`${errors.movil ? "border-red-500 pr-10" : campoValido("movil") ? "border-green-500 pr-10" : ""}`} 
            />
            {campoValido("movil") && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />}
          </div>
          {errors.movil && <p className="text-red-500 text-xs">{errors.movil}</p>}
        </div>

        {/* --- CONTRASEÑA --- */}
        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input 
              name="password" 
              type={mostrarPassword ? "text" : "password"} 
              placeholder="Mínimo 6 caracteres" 
              value={formData.password} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`${errors.password ? "border-red-500 pr-10" : campoValido("password") ? "border-green-500 pr-10" : "pr-10"}`} 
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
        </div>

        {/* --- CONFIRMAR CONTRASEÑA --- */}
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <div className="relative">
            <Input 
              name="confirmPassword" 
              type={mostrarConfirmPassword ? "text" : "password"} 
              placeholder="Repite tu contraseña" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              onBlur={handleBlur} 
              className={`${errors.confirmPassword ? "border-red-500 pr-10" : campoValido("confirmPassword") ? "border-green-500 pr-10" : "pr-10"}`} 
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {mostrarConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
          Registrarse
        </Button>
      </form>
    </>
  );
}