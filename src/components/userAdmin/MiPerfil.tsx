import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { Camera, Save, ShieldCheck, User as UserIcon, Home, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 🔥 1. IMPORTAMOS EL STORE GLOBAL
import { useAuthStore } from "@/stores/useAuthStore";

export default function MiPerfil() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [movil, setMovil] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  // 🔥 2. TRAEMOS LAS FUNCIONES MAGICAS DE ZUSTAND
  const updateUserName = useAuthStore((state: any) => state.updateUserName);
  const updateUserAvatar = useAuthStore((state: any) => state.updateUserAvatar);

  const contrasenasCoinciden = nuevaPassword === confirmarPassword && nuevaPassword.length > 0;
  const mostrarErrorPass = confirmarPassword.length > 0 && nuevaPassword !== confirmarPassword;
  const botonPasswordDeshabilitado = nuevaPassword.length < 6 || !contrasenasCoinciden;

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
      
      // 🔥 3. AQUÍ LE PASAMOS LA VOZ AL NAVBAR PARA EL NOMBRE
      updateUserName(nombre);
      console.log("Navbar avisado del cambio de nombre a:", nombre);

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
      
      // Con la ruta de la carpeta para respetar tus políticas de Supabase
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("¡Avatar actualizado!", { id: toastId });
      
      // 🔥 4. AQUÍ LE PASAMOS LA VOZ AL NAVBAR PARA LA FOTO
      updateUserAvatar(publicUrl);
      console.log("Navbar avisado del cambio de avatar:", publicUrl);

    } catch (error) {
      console.error("Error subiendo avatar:", error);
      toast.error("Error al subir la imagen. Verifica tu Storage.", { id: toastId });
    }
  };

  const handleActualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (botonPasswordDeshabilitado) return;

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

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Cargando tu perfil...</div>;

  return (
    <div className="max-w-6xl mx-auto py-4 px-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: IDENTIDAD */}
        <Card className="border border-slate-100 shadow-md overflow-hidden lg:col-span-4 rounded-xl bg-white">
          <div className="h-24 bg-gradient-to-tr from-green-600 via-emerald-500 to-teal-400"></div>
          <CardContent className="px-5 pb-6 relative -mt-12 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-50 flex items-center justify-center overflow-hidden shadow-md ring-2 ring-green-50">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-green-600 tracking-tighter">{getIniciales(nombre)}</span>
                )}
              </div>
              
              <Label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-green-600 p-2 rounded-full text-white cursor-pointer hover:bg-green-700 transition-all shadow-md group-hover:scale-110">
                <Camera className="w-3.5 h-3.5" />
              </Label>
              <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleCambiarAvatar} />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mt-4">{nombre || "Usuario"}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{email}</p>
            
            <div className="flex items-center gap-1.5 mt-3 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">
              <Home className="w-3.5 h-3.5" />
              <span>Gestor de Familia</span>
            </div>
          </CardContent>
        </Card>

        {/* COLUMNA DERECHA: FORMULARIOS */}
        <div className="lg:col-span-8 space-y-4">
          
          <Card className="shadow-md border-slate-100 rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                <div className="p-1.5 bg-green-100 rounded-md">
                  <UserIcon className="w-4 h-4 text-green-600" />
                </div>
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleActualizarDatos} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Correo Electrónico</Label>
                    <Input type="email" value={email} disabled className="bg-slate-50 text-slate-400 cursor-not-allowed h-9 border-slate-200 font-medium text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nombre Completo</Label>
                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej. Micaela Pérez" className="h-9 border-slate-300 focus-visible:ring-green-600 focus-visible:border-green-600 font-medium text-slate-800 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Teléfono Móvil</Label>
                    <Input value={movil} onChange={(e) => setMovil(e.target.value)} placeholder="Ej. +34 600 000 000" className="h-9 border-slate-300 focus-visible:ring-green-600 focus-visible:border-green-600 font-medium text-slate-800 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white h-9 px-5 text-sm font-semibold shadow-sm transition-all hover:shadow-md">
                    <Save className="w-3.5 h-3.5 mr-2" /> Guardar Cambios
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-100 rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-slate-100 rounded-md">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                  </div>
                  Seguridad
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">Actualiza tu contraseña para proteger tu despensa.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleActualizarPassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nueva Contraseña</Label>
                    <Input 
                      type="password" 
                      value={nuevaPassword} 
                      onChange={(e) => setNuevaPassword(e.target.value)} 
                      placeholder="Mínimo 6 caracteres" 
                      required 
                      className="h-9 border-slate-300 focus-visible:ring-green-600 focus-visible:border-green-600 text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5 relative">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex justify-between">
                      Confirmar Contraseña
                      {contrasenasCoinciden && <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Coinciden</span>}
                      {mostrarErrorPass && <span className="text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3"/> No coinciden</span>}
                    </Label>
                    <Input 
                      type="password" 
                      value={confirmarPassword} 
                      onChange={(e) => setConfirmarPassword(e.target.value)} 
                      placeholder="Repite la contraseña" 
                      required 
                      className={`h-9 text-sm focus-visible:ring-green-600 ${mostrarErrorPass ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300'}`} 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
                  <Button 
                    type="submit" 
                    variant="outline" 
                    disabled={botonPasswordDeshabilitado}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-9 px-5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Actualizar Contraseña
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