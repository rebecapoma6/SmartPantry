import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import TablaFamilias from "@/components/superAdmin/TablaFamilias";
import { SupaBasFamiliasRepository } from "@/database/supabase/SupaBasFamiliasRepository";



export default function SAdminFamiliasPage() {
    const [familias, setFamilias] = useState<any[]>([]);
    const [confirmarEliminarAbierto, setConfirmarEliminarAbierto] = useState(false);
    const [familiaAEliminar, setFamiliaAEliminar] = useState<{ id: string, nombre: string } | null>(null);

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
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gestión de Familias</h1>
                <p className="text-slate-500 mt-1">Directorio maestro y administración de cuentas</p>
            </div>

            <TablaFamilias
                familias={familias}
                onPrepararEliminacion={(id, nombre) => {
                    setFamiliaAEliminar({ id, nombre });
                    setConfirmarEliminarAbierto(true);
                }}
            />

            {/* MODAL ELIMINAR */}
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