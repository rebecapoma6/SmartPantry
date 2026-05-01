import { useEffect, useState } from "react";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { Users, Home, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SupaBasFamiliasRepository } from "@/database/supabase/SupaBasFamiliasRepository";

export default function AdminGeneralPage() {
    const [stats, setStats] = useState({ totalUsuarios: 0, totalFamilias: 0, nuevosMes: 0 });

    const cargarDatos = async () => {
        try {
            // Solo traemos la cantidad para las tarjetas
            const familiasConRoles = await SupaBasFamiliasRepository.obtenerFamiliasConJefes();
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
            toast.error("Error al cargar las estadísticas.");
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

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
                    <div><p className="text-sm text-slate-500">Usuarios Totales</p><p className="text-2xl font-bold">{stats.totalUsuarios}</p></div>
                </CardContent></Card>
                <Card className="border-none shadow-sm"><CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Home /></div>
                    <div><p className="text-sm text-slate-500">Familias Activas</p><p className="text-2xl font-bold">{stats.totalFamilias}</p></div>
                </CardContent></Card>
                <Card className="border-none shadow-sm"><CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600"><TrendingUp /></div>
                    <div><p className="text-sm text-slate-500">Nuevos Registros</p><p className="text-2xl font-bold">+{stats.nuevosMes}</p></div>
                </CardContent></Card>
            </div>

            {/* ESPACIO PARA FUTURAS GRÁFICAS */}
            <Card className="border-none shadow-sm h-96 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200">
                <BarChart3 className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-medium text-slate-600">Resumen de Crecimiento</h3>
                <p className="text-sm text-slate-400 text-center max-w-sm mt-2">
                    Aquí se implementará la gráfica visual de usuarios vs familias a lo largo de los meses.
                </p>
            </Card>
        </div>
    );
}