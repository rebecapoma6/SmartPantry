import { useEffect, useState } from "react";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { Users, Home, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import TablaFamilias from "@/components/superAdmin/TablaFamilias";
import { SupaBasFamiliasRepository } from "@/database/supabase/SupaBasFamiliasRepository";

// Datos simulados para la gráfica (Luego puedes traerlos de Supabase agrupados por mes)
const datosCrecimiento = [
    { mes: 'Ene', usuarios: 5, familias: 2 },
    { mes: 'Feb', usuarios: 12, familias: 4 },
    { mes: 'Mar', usuarios: 25, familias: 8 },
    { mes: 'Abr', usuarios: 42, familias: 15 },
    { mes: 'May', usuarios: 68, familias: 22 },
    { mes: 'Jun', usuarios: 100, familias: 35 },
];

export default function AdminGeneralPage() {
    const [familias, setFamilias] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsuarios: 0, totalFamilias: 0, nuevosMes: 0 });
    const [confirmarEliminarAbierto, setConfirmarEliminarAbierto] = useState(false);
    const [familiaAEliminar, setFamiliaAEliminar] = useState<{ id: string, nombre: string } | null>(null);

    const cargarDatos = async () => {
        try {
            // 1. El repositorio hace la magia pesada
            const familiasConRoles = await SupaBasFamiliasRepository.obtenerFamiliasConJefes();
            setFamilias(familiasConRoles);

            // 2. Estadísticas (Contamos todo rapidito)
            const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

            setStats({
                totalUsuarios: userCount || 0,
                totalFamilias: familiasConRoles.length,
                nuevosMes: 15
            });

        } catch (error) {
            console.error("Error al cargar la página:", error);
            toast.error("Error al cargar los datos de las familias.");
        }
    };

    // 🔥 ¡El useEffect se queda! Es el que arranca todo al entrar a la página
    useEffect(() => {
        cargarDatos();
    }, []);

    const handleEliminarFamilia = async (id: string, nombre: string) => {
        try {
            // Usamos la función de eliminar de tu repositorio para mantener el orden
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
        <div className="p-6 pt-24 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">SmartPantry</h1>
                    <p className="text-slate-500 mt-1">Panel de Control para Súper Administrador</p>
                </div>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm"><CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Users /></div>
                    <div><p className="text-sm text-slate-500">Usuarios</p><p className="text-2xl font-bold">{stats.totalUsuarios}</p></div>
                </CardContent></Card>
                <Card className="border-none shadow-sm"><CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Home /></div>
                    <div><p className="text-sm text-slate-500">Familias Activas</p><p className="text-2xl font-bold">{stats.totalFamilias}</p></div>
                </CardContent></Card>
                <Card className="border-none shadow-sm"><CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600"><TrendingUp /></div>
                    <div><p className="text-sm text-slate-500">Nuevos</p><p className="text-2xl font-bold">+{stats.nuevosMes}</p></div>
                </CardContent></Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Listado Maestro de Familias</h2>
                {/* LLAMADA A LA TABLA */}
                <TablaFamilias
                    familias={familias}
                    onPrepararEliminacion={(id, nombre) => {
                        setFamiliaAEliminar({ id, nombre });
                        setConfirmarEliminarAbierto(true);
                    }}
                />
            </div>

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