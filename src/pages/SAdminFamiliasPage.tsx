import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import TablaFamilias from "@/components/superAdmin/TablaFamilias";
import { SupaBasFamiliasRepository } from "@/database/supabase/SupaBasFamiliasRepository";
import { Badge } from "@/components/ui/badge";
import { formatearUltimoAcceso } from "@/utils/formatear";



export default function SAdminFamiliasPage() {
    const [familias, setFamilias] = useState<any[]>([]);

    const [confirmarEliminarAbierto, setConfirmarEliminarAbierto] = useState(false);
    const [familiaAEliminar, setFamiliaAEliminar] = useState<{ id: string, nombre: string } | null>(null);

    const [modalUsuariosAbierto, setModalUsuariosAbierto] = useState(false);
    const [familiaSeleccionada, setFamiliaSeleccionada] = useState<any | null>(null);


    const cargarDatos = async () => {
        try {
            const familiasConRoles = await SupaBasFamiliasRepository.obtenerFamiliasConJefes();
            setFamilias(familiasConRoles);
        } catch (error) {
            toast.error("Error al cargar los datos de las familias.");
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleEliminarFamilia = async (id: string, nombre: string) => {
        try {
            await SupaBasFamiliasRepository.eliminarFamilia(id);
            toast.success(`Familia "${nombre}" eliminada de la plataforma.`);
            cargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar la familia.");
        } finally {
            setConfirmarEliminarAbierto(false);
            setFamiliaAEliminar(null);
        }
    };

    return (
      <div className="p-6 pt-24 max-w-7xl mx-auto space-y-6 bg-muted min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gestión de Familias</h1>
                <p className="text-muted-foreground mt-1">Directorio maestro y administración de cuentas</p>
            </div>

            <TablaFamilias
                familias={familias}
                onPrepararEliminacion={(id, nombre) => {
                    setFamiliaAEliminar({ id, nombre });
                    setConfirmarEliminarAbierto(true);
                }}
                // 🔥 Recibimos la llamada del botón de la tabla
                onVerUsuarios={(familia) => {
                    setFamiliaSeleccionada(familia);
                    setModalUsuariosAbierto(true);
                }}
            />

            {/* 🔥 MODAL PARA VER USUARIOS (INVITADOS Y GESTOR) */}
            <Dialog open={modalUsuariosAbierto} onOpenChange={setModalUsuariosAbierto}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-slate-800">
                            Usuarios de {familiaSeleccionada?.nombre}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="max-h-[50vh] overflow-y-auto pr-2">
                        {familiaSeleccionada?.profiles?.length > 0 ? (
                            <ul className="divide-y divide-slate-100">
                                {familiaSeleccionada.profiles.map((perfil: any) => (
                                    <li key={perfil.id} className="py-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                                                {perfil.nombre ? perfil.nombre.substring(0, 2).toUpperCase() : "US"}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-800">{perfil.nombre || "Usuario"}</span>
                                                    <Badge className={`px-2 py-0 border-none text-[10px] ${perfil.rol_asignado === 'AdminUser' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-slate-600'}`}>
                                                        {perfil.rol_asignado === 'AdminUser' ? 'Gestor' : 'Invitado'}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-slate-400 mt-0.5">
                                                    Último acceso: {perfil.ultimo_acceso ? formatearUltimoAcceso(perfil.ultimo_acceso) : 'Aún no ha ingresado'}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No hay usuarios registrados en esta familia.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL ELIMINAR (Tu código original) */}
            <Dialog open={confirmarEliminarAbierto} onOpenChange={setConfirmarEliminarAbierto}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="text-rose-600">¿Eliminar familia?</DialogTitle></DialogHeader>
                    <p className="py-4 text-slate-600">Vas a eliminar a la <strong>{familiaAEliminar?.nombre}</strong>. Esta acción no se puede deshacer.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmarEliminarAbierto(false)}>Cancelar</Button>
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { if (familiaAEliminar) handleEliminarFamilia(familiaAEliminar.id, familiaAEliminar.nombre); }}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}