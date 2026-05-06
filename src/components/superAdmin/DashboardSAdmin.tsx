import { useEffect, useState } from "react";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { Users, Home, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupaBasFamiliasRepository } from "@/database/supabase/SupaBasFamiliasRepository";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardSAdmin() {
    const [stats, setStats] = useState({ totalUsuarios: 0, totalFamilias: 0, nuevosMes: 0 });
    const [datosGrafico, setDatosGrafico] = useState<any[]>([]);

    const cargarDatos = async () => {
        try {
            const familiasConRoles = await SupaBasFamiliasRepository.obtenerFamiliasConJefes();
            const { data: perfiles, count: userCount } = await supabase
                .from('profiles')
                .select('created_at', { count: 'exact' });

            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const datosAgrupados = meses.map(mes => ({ name: mes, Usuarios: 0, Familias: 0 }));

            const mesActual = new Date().getMonth();
            const anioActual = new Date().getFullYear();
            let nuevosEsteMes = 0;

            familiasConRoles.forEach((f: any) => {
                if (f.created_at) {
                    const fecha = new Date(f.created_at);
                    if (fecha.getFullYear() === anioActual) {
                        datosAgrupados[fecha.getMonth()].Familias += 1;
                    }
                }
            });

            perfiles?.forEach(p => {
                if (p.created_at) {
                    const fecha = new Date(p.created_at);
                    if (fecha.getFullYear() === anioActual) {
                        datosAgrupados[fecha.getMonth()].Usuarios += 1;
                        if (fecha.getMonth() === mesActual) {
                            nuevosEsteMes += 1;
                        }
                    }
                }
            });

            setDatosGrafico(datosAgrupados);
            setStats({
                totalUsuarios: userCount || 0,
                totalFamilias: familiasConRoles.length,
                nuevosMes: nuevosEsteMes
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
        <div className="space-y-8">
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
                    <div><p className="text-sm text-slate-500">Nuevos este mes</p><p className="text-2xl font-bold">+{stats.nuevosMes}</p></div>
                </CardContent></Card>
            </div>

            <Card className="border-none shadow-sm bg-background">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-700">Resumen de Crecimiento ({new Date().getFullYear()})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-96 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Usuarios" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Familias" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}