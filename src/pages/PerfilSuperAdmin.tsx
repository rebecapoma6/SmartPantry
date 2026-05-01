import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { Camera, Save, ShieldCheck, User as UserIcon } from "lucide-react"; // Se quitó 'Lock'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PerfilSuperAdmin() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [movil, setMovil] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("No hay usuario activo");
        
        setUserId(user.id);
        setEmail(user.email || "");

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('nombre, movil, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setNombre(profileData.nombre || "");
          setMovil(profileData.movil || "");
          setAvatarUrl(profileData.avatar_url);
        }
      } catch (error) {
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  const handleActualizarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    const toastId = toast.loading("Actualizando datos...");
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nombre, movil })
        .eq('id', userId);

      if (error) throw error;
      toast.success("¡Datos actualizados con éxito!", { id: toastId });
    } catch (error) {
      toast.error("Error al guardar los datos", { id: toastId });
    }
  };

  const handleCambiarAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const toastId = toast.loading("Subiendo imagen...");
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("¡Avatar actualizado!", { id: toastId });
    } catch (error) {
      toast.error("Error al subir la imagen", { id: toastId });
    }
  };

  const handleActualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nuevaPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const toastId = toast.loading("Cambiando contraseña...");
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
      
      if (error) throw error;
      
      toast.success("¡Contraseña actualizada correctamente!", { id: toastId });
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (error) {
      toast.error("Error al cambiar la contraseña", { id: toastId });
    }
  };

  const getIniciales = (nom: string) => {
    if (!nom) return "??";
    return nom.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 pt-24 min-h-screen">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-500 mt-1">Configuración de cuenta Súper Admin de SmartPantry</p>
      </div>

      {/* GRID COMPACTO: 1 Columna en móvil, 3 Columnas en pantallas grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: IDENTIDAD (Ocupa 1/3) */}
        <Card className="border-none shadow-sm overflow-hidden lg:col-span-1">
          {/* Degradado Verde SmartPantry */}
          <div className="h-28 bg-gradient-to-r from-success to-primary"></div>
          <CardContent className="px-6 pb-6 relative -mt-14 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-success">{getIniciales(nombre)}</span>
                )}
              </div>
              
              <Label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-success p-2.5 rounded-full text-white cursor-pointer hover:bg-success-hover transition shadow-sm group-hover:scale-105">
                <Camera className="w-4 h-4" />
              </Label>
              <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleCambiarAvatar} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-4">{nombre || "Admin"}</h2>
            <div className="flex items-center gap-1.5 mt-2 bg-success/10 text-success px-3 py-1 rounded-full text-xs font-semibold border border-success/20">
              <ShieldCheck className="w-4 h-4" />
              <span>AdminGeneral</span>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA: FORMULARIOS APILADOS (Ocupa 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DATOS PERSONALES */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-success" /> Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleActualizarDatos} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 uppercase font-semibold">Correo Electrónico</Label>
                    <Input type="email" value={email} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 uppercase font-semibold">Nombre Completo</Label>
                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej. Micaela Pérez" className="h-9 focus-visible:ring-success" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-slate-500 uppercase font-semibold">Teléfono Móvil</Label>
                    <Input value={movil} onChange={(e) => setMovil(e.target.value)} placeholder="Ej. +34 600 000 000" className="h-9 focus-visible:ring-success" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="bg-success hover:bg-success-hover text-white h-9">
                    <Save className="w-4 h-4 mr-2" /> Actualizar Datos
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* SEGURIDAD */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-400" /> Seguridad de Cuenta
              </CardTitle>
              <CardDescription className="text-xs">Modifica tu contraseña de acceso a SmartPantry.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleActualizarPassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 uppercase font-semibold">Nueva Contraseña</Label>
                    <Input type="password" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className="h-9 focus-visible:ring-success" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 uppercase font-semibold">Confirmar Contraseña</Label>
                    <Input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} placeholder="Repite la contraseña" required className="h-9 focus-visible:ring-success" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 h-9">
                    Cambiar Contraseña
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}