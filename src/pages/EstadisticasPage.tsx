import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ControlFinanciero from "@/components/userAdmin/ControlFinanciero";

export default function EstadisticasPage() {
    const sessionUser = useAuthStore((state) => state.sessionUser);
    const [datosCategoria, setDatosCategoria] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    // Nuestra paleta de colores para que hagan match
    const COLORES = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    useEffect(() => {
        const cargarEstadisticas = async () => {
            if (!sessionUser?.profile?.familia_id) return;

            const { data: productos } = await supabase
                .from('productos')
                .select('nombre, precio, cantidad, categorias(nombre)')
                .eq('familia_id', sessionUser.profile.familia_id);

            if (productos) {
                const agrupado: Record<string, number> = {};

                productos.forEach((p: any) => {
                    const catNombre = Array.isArray(p.categorias)
                        ? p.categorias[0]?.nombre
                        : p.categorias?.nombre;

                    const nombreFinal = catNombre || 'Sin Categoría';
                    const valorTotal = (p.precio || 0) * (p.cantidad || 0);

                    agrupado[nombreFinal] = (agrupado[nombreFinal] || 0) + valorTotal;
                });

                const dataParaGrafico = Object.keys(agrupado).map(key => ({
                    name: key,
                    valor: Number(agrupado[key].toFixed(2))
                }));

                setDatosCategoria(dataParaGrafico);
            }
            setCargando(false);
        };
        cargarEstadisticas();
    }, [sessionUser?.profile?.familia_id]);

    const dineroTotal = datosCategoria.reduce((acc, curr) => acc + curr.valor, 0);

    return (
        <div className="p-6 pt-24 max-w-6xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Control de Gastos</h2>
                <ControlFinanciero />
            </div>
            <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard SmartPantry</h1>
                    <p className="text-muted-foreground">Analíticas y valorización de tu despensa.</p>
                </div>
            </div>

            {cargando ? (
                <div className="text-center py-10">Cargando métricas...</div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Gráfico 1: Valor Invertido por Categoría (Barras) */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-500" /> Valor Invertido por Categoría (€)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px]">
                                {datosCategoria.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datosCategoria} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                                            {/* 🔥 2. Hacemos que el Tooltip muestre el nombre de la categoría */}
                                            <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(value) => [`${value}€`, 'Inversión']} />
                                            {/* 🔥 3. Le pasamos los colores celda por celda a las barras */}
                                            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                                {datosCategoria.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">Sin datos para mostrar</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Gráfico 2: Distribución (Dona) */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieIcon className="w-5 h-5 text-purple-500" /> Distribución del Inventario
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px] flex flex-col items-center relative">
                                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
                                    <p className="text-xs text-muted-foreground uppercase">Total en Despensa</p>
                                    <p className="text-2xl font-bold text-slate-800">{dineroTotal.toFixed(0)}€</p>
                                </div>

                                {datosCategoria.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={datosCategoria}
                                                innerRadius={65}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="valor"
                                                nameKey="name"
                                            >
                                                {datosCategoria.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [`${value}€`, name]} />
                                            {/* 🔥 4. Agregamos la leyenda interactiva abajo */}
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">Sin datos para mostrar</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}