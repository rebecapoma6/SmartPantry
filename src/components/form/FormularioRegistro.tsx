import { useState, type ChangeEvent, type FocusEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validacionesRegistro } from '@/utils/validacionesRegistro';

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
}

interface ErrorsProps {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function FormularioRegistro() {
  const navigate = useNavigate();
  const userRepository = createUserRepository();
  const setSession = useAuthStore(state => state.setSession);

  const [formData, setFormData] = useState<FormDataProps>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar_file: null
  });

  const [errors, setErrors] = useState<ErrorsProps>({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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
      toast.error('Todos los campos son obligatorios.');
    }
  }; 

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto p-6 bg-white rounded-xl shadow-xl/30  border">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-green-700">Crear Cuenta</h2>
        <p className="text-sm text-gray-500">Únete a SmartPantry y organiza tu despensa</p>
      </div>

      <div className="flex justify-center mb-6">
        <ImageInput 
          name="avatar" 
          onFileSelect={handleFileSelect} 
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="nombre">Nombre Completo</Label>
        <Input name="nombre" type="text" placeholder="Ej. María Pérez" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} className={errors.nombre ? "border-red-500" : ""} />
        {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input name="email" type="email" placeholder="tu@correo.com" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={errors.email ? "border-red-500" : ""} />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={errors.password ? "border-red-500" : ""} />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <Input name="confirmPassword" type="password" placeholder="Repite tu contraseña" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={errors.confirmPassword ? "border-red-500" : ""} />
        {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
        Registrarse
      </Button>
    </form>
  );
}