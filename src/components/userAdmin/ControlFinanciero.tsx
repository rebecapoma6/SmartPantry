import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Wallet, ShoppingBag, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- DATOS SIMULADOS (MOCK) SOLO PARA EL GRÁFICO DE LÍNEAS ---
// Mantenemos el formato dd-mm-yyyy
const datosHistorialGastos = [
    { fecha: '01-04-2026', gasto: 120 },
    { fecha: '08-04-2026', gasto: 85 },
    { fecha: '15-04-2026', gasto: 150 },
    { fecha: '22-04-2026', gasto: 90 },
    { fecha: '29-04-2026', gasto: 110 },
    { fecha: '06-05-2026', gasto: 75 },
];

interface ProductoInversion {
    nombre: string;
    cantidad: number;
    valorTotal: number;
}

export default function ControlFinanciero() {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const [inversionTotal, setInversionTotal] = useState(0);
    const [topInversion, setTopInversion] = useState<ProductoInversion[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatosReales = async () => {
            if (!sessionUser?.profile?.familia_id) return;

            const { data: productos } = await supabase
                .from('productos')
                .select('nombre, precio, cantidad')
                .eq('familia_id', sessionUser.profile.familia_id);

            if (productos) {
                // 1. Calculamos el total de dinero en la despensa
                const total = productos.reduce((acc, p) => acc + ((p.precio || 0) * (p.cantidad || 0)), 0);
                setInversionTotal(total);

                // 2. Calculamos los productos donde hay más dinero invertido (DATOS REALES)
                const productosCalculados = productos.map(p => ({
                    nombre: p.nombre,
                    cantidad: p.cantidad || 0,
                    valorTotal: (p.precio || 0) * (p.cantidad || 0)
                }));

                // Ordenamos de mayor a menor valor y nos quedamos con los 4 primeros
                const top4 = productosCalculados
                    .sort((a, b) => b.valorTotal - a.valorTotal)
                    .slice(0, 4);

                setTopInversion(top4);
            }
            setCargando(false);
        };
        
        cargarDatosReales();
    }, [sessionUser?.profile?.familia_id]);

    if (cargando) return <div className="text-center py-8 text-slate-500">Analizando finanzas...</div>;

    return (
        <div className="space-y-6">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Gasto Este Mes (Demo)</p>
                            <h3 className="text-2xl font-bold text-slate-800">435.00€</h3>
                            <p className="text-xs text-rose-500 flex items-center mt-1 font-medium">
                                <TrendingUp className="w-3 h-3 mr-1" /> +12% vs mes anterior
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-green-500">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Valor en Despensa Real</p>
                            <h3 className="text-2xl font-bold text-slate-800">{inversionTotal.toFixed(2)}€</h3>
                            <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
                                Capital inmovilizado actual
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-full">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Gasto Semanal Demo</p>
                            <h3 className="text-2xl font-bold text-slate-800">105.00€</h3>
                            <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                                <TrendingDown className="w-3 h-3 mr-1" /> -5% vs semana anterior
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GRÁFICO DE TENDENCIA (Mock Data) */}
                <Card className="shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Evolución de Gastos (Prototipo)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={datosHistorialGastos} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="fecha" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                                <Tooltip 
                                    formatter={(value) => [`${value}€`, 'Gasto']}
                                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="gasto" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* TABLA DE MAYOR INVERSIÓN (DATOS 100% REALES) */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Mayor Inversión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topInversion.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No hay productos en la despensa.</p>
                        ) : (
                            <ul className="space-y-4">
                                {topInversion.map((prod, index) => (
                                    <li key={index} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">{prod.nombre}</p>
                                            <p className="text-xs text-slate-500">Stock: {prod.cantidad} unidades</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800">{prod.valorTotal.toFixed(2)}€</span>
                                            <div className="p-1.5 rounded-full bg-amber-100 text-amber-600">
                                                <Package className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
            
        </div>
    );
}