import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { Users, Link as LinkIcon, Trash2, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatearIniciales } from "@/utils/formatear";

interface MiembroFamilia {
    id: string;
    nombre: string;
    avatar_url: string | null;
    rol: string;
}

export default function GestionMiembros() {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const [miembros, setMiembros] = useState<MiembroFamilia[]>([]);
    const [cargando, setCargando] = useState(true);

    const linkInvitacion = sessionUser?.profile?.familia_id
        ? `${window.location.origin}/registro?familia=${sessionUser.profile.familia_id}`
        : "";

    useEffect(() => {
        cargarMiembros();
    }, [sessionUser?.profile?.familia_id]);

    const cargarMiembros = async () => {
        if (!sessionUser?.profile?.familia_id) return;

        setCargando(true);
        try {
            const { data: perfilesData, error: perfilesError } = await supabase
                .from('profiles')
                .select('id, nombre, avatar_url')
                .eq('familia_id', sessionUser.profile.familia_id);

            if (perfilesError) throw perfilesError;

            if (perfilesData && perfilesData.length > 0) {
                const idsFamiliares = perfilesData.map(p => p.id);


                const { data: rolesData, error: rolesError } = await supabase
                    .from('user_roles')
                    .select('user_id, role')
                    .in('user_id', idsFamiliares);

                if (rolesError) throw rolesError;

                // Formateamos la data para que sea más fácil de usar en React

                const miembrosFormateados = perfilesData.map(perfil => {
                    const rolEncontrado = rolesData?.find(r => r.user_id === perfil.id);
                    return {
                        id: perfil.id,
                        nombre: perfil.nombre,
                        avatar_url: perfil.avatar_url,
                        rol: rolEncontrado?.role || 'Usuario' // Si no le encuentra rol, asume que es Usuario
                    };
                });
                setMiembros(miembrosFormateados);

            } else { setMiembros([]); }
        } catch (error) {
            console.error("Error al cargar miembros:", error);
            toast.error("No se pudieron cargar los miembros de la familia.");
        } finally {
            setCargando(false);
        }
    };

    const handleCopiarLink = () => {
        if (!linkInvitacion) return;
        navigator.clipboard.writeText(linkInvitacion);
        toast.success("¡Enlace de invitación copiado al portapapeles!");
    };

    const handleExpulsarMiembro = (id: string, nombre: string) => {
        // Evitar que el Gestor se expulse a sí mismo por accidente
        if (id === sessionUser?.profile?.id) {
            toast.error("No puedes expulsarte a ti mismo de la familia.");
            return;
        }

        toast((t) => (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="text-sm font-semibold text-gray-900">¿Expulsar a {nombre}?</p>
                    <p className="text-xs text-gray-500 mt-1">Perderá acceso a la despensa compartida.</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const idCarga = toast.loading("Expulsando miembro...");

                            // Para expulsar a alguien, simplemente le quitamos el familia_id de su perfil
                            const { error } = await supabase
                                .from('profiles')
                                .update({ familia_id: null })
                                .eq('id', id);

                            if (error) {
                                console.error("Error al expulsar:", error);
                                toast.error("Hubo un problema al expulsar al miembro.", { id: idCarga });
                            } else {
                                toast.success(`${nombre} ha sido expulsado de la familia.`, { id: idCarga });
                                // Actualizamos la lista local
                                setMiembros(prev => prev.filter(m => m.id !== id));
                            }
                        }}
                    >
                        Sí, expulsar
                    </Button>
                </div>
            </div>
        ), { duration: 5000 });
    };



    return (
        <div className="space-y-6">
            {/* TARJETA DE INVITACIÓN */}
            <Card className="border-none shadow-sm bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                        <Users className="w-5 h-5" /> Invitar a mi Familia
                    </CardTitle>
                    <CardDescription className="text-blue-600/80">
                        Comparte este enlace con tus familiares. Al registrarse, se unirán automáticamente a tu despensa.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            readOnly
                            value={linkInvitacion || "Generando enlace..."}
                            className="bg-white border-blue-200 text-slate-600 font-mono text-sm"
                        />
                        <Button onClick={handleCopiarLink} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                            <LinkIcon className="w-4 h-4 mr-2" /> Copiar Enlace
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* LISTA DE MIEMBROS */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Miembros Actuales ({miembros.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {cargando ? (
                        <div className="text-center py-8 text-slate-500">Cargando familia...</div>
                    ) : miembros.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No hay más miembros en tu familia aún.</div>
                    ) : (
                        <ul className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
                            {miembros.map((miembro) => (
                                <li key={miembro.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">

                                    {/* Info del Miembro */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden shrink-0">
                                            {miembro.avatar_url ? (
                                                <img src={miembro.avatar_url} alt={miembro.nombre} className="w-full h-full object-cover" />
                                            ) : (
                                                formatearIniciales(miembro.nombre)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 flex items-center gap-2">
                                                {miembro.nombre}
                                                {miembro.id === sessionUser?.profile?.id && (
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">Tú</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                {miembro.rol === 'AdminUser' ? (
                                                    <><Shield className="w-3 h-3 text-success" /> Gestor</>
                                                ) : (
                                                    <><UserIcon className="w-3 h-3" /> Usuario</>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Acción (No mostrar botón de borrar si es uno mismo o si es otro Gestor) */}
                                    {miembro.id !== sessionUser?.profile?.id && miembro.rol !== 'AdminUser' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                            onClick={() => handleExpulsarMiembro(miembro.id, miembro.nombre)}
                                            title="Expulsar de la familia"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}