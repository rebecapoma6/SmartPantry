import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Wallet, ShoppingBag, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductoInversion {
    nombre: string;
    formato: string | null; // 🔥 Añadimos el formato aquí
    cantidad: number;
    valorTotal: number;
}

const COLORES_FIJOS: Record<string, string> = {
    'Carnes y Frescos': 'var(--chart-1)',
    'Lácteos': 'var(--chart-2)',
    'Verduras y Frutas': 'var(--chart-3)',
    'Limpieza': 'var(--chart-4)',
    'Snacks y Dulces': 'var(--chart-5)',
    'Bebidas': 'var(--primary)',
    'Despensa': 'var(--success)',
    'Sin Categoría': 'var(--muted-foreground)'
};

const COLORES_EXTRA = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'];

export default function ControlFinanciero() {
    const sessionUser = useAuthStore((state) => state.sessionUser);

    const [inversionTotal, setInversionTotal] = useState(0);
    const [topInversion, setTopInversion] = useState<ProductoInversion[]>([]);

    const [gastoMensual, setGastoMensual] = useState({ total: 0, tendencia: 0 });
    const [gastoSemanal, setGastoSemanal] = useState({ total: 0, tendencia: 0 });

    const [datosDona, setDatosDona] = useState<{ name: string, value: number }[]>([]);

    const [historialAnual, setHistorialAnual] = useState<{ mes: string, gasto: number }[]>([]);

    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatosReales = async () => {
            if (!sessionUser?.profile?.familia_id) return;

            // 🔥 Añadimos "formato" en la consulta a Supabase
            const { data: productos, error } = await supabase
                .from('productos')
                .select(`
                    nombre, 
                    formato, 
                    precio, 
                    cantidad, 
                    created_at, 
                    categorias ( nombre )
                `)
                .eq('familia_id', sessionUser.profile.familia_id);

            if (error) {
                console.error("ERROR DE SUPABASE:", error);
                setCargando(false);
                return;
            }

            if (productos && productos.length > 0) {
                const hoy = new Date();

                const hace7Dias = new Date(hoy); hace7Dias.setDate(hoy.getDate() - 7);
                const hace14Dias = new Date(hoy); hace14Dias.setDate(hoy.getDate() - 14);

                const mesActual = hoy.getMonth();
                const anioActual = hoy.getFullYear();
                const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
                const anioMesAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

                let acumuladoMesActual = 0;
                let acumuladoMesAnterior = 0;
                let acumuladoSemanaActual = 0;
                let acumuladoSemanaAnterior = 0;
                let capitalInmovilizado = 0;

                let mapaCategorias = new Map();

                const mesesDelAnio = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const gastosPorMes = mesesDelAnio.map(mes => ({ mes, gasto: 0 }));

                const productosCalculados = productos.map((p: any) => {
                    const cantidad = p.cantidad || 0;
                    const precio = p.precio || 0;
                    const valorTotal = precio * cantidad;
                    const fechaIngreso = new Date(p.created_at);

                    const nombreCategoria = p.categorias?.nombre || 'Sin Categoría';

                    capitalInmovilizado += valorTotal;

                    // Acumulando para la dona
                    if (mapaCategorias.has(nombreCategoria)) {
                        mapaCategorias.set(nombreCategoria, mapaCategorias.get(nombreCategoria) + valorTotal);
                    } else {
                        mapaCategorias.set(nombreCategoria, valorTotal);
                    }
                    if (fechaIngreso.getFullYear() === anioActual) {
                        gastosPorMes[fechaIngreso.getMonth()].gasto += valorTotal;
                    }

                    if (fechaIngreso.getMonth() === mesActual && fechaIngreso.getFullYear() === anioActual) {
                        acumuladoMesActual += valorTotal;
                    } else if (fechaIngreso.getMonth() === mesAnterior && fechaIngreso.getFullYear() === anioMesAnterior) {
                        acumuladoMesAnterior += valorTotal;
                    }

                    if (fechaIngreso >= hace7Dias) {
                        acumuladoSemanaActual += valorTotal;
                    } else if (fechaIngreso >= hace14Dias && fechaIngreso < hace7Dias) {
                        acumuladoSemanaAnterior += valorTotal;
                    }

                    // 🔥 Retornamos el formato también
                    return { nombre: p.nombre, formato: p.formato || null, cantidad, valorTotal };
                });

                const calcularTendencia = (actual: number, anterior: number) => {
                    if (anterior === 0) return actual > 0 ? 100 : 0;
                    return ((actual - anterior) / anterior) * 100;
                };

                let datosGraficoDona = Array.from(mapaCategorias, ([name, value]) => ({
                    name,
                    value: parseFloat(value.toFixed(2))
                })).sort((a, b) => b.value - a.value);

                const datosGraficoBarras = gastosPorMes.map(item => ({
                    mes: item.mes,
                    gasto: parseFloat(item.gasto.toFixed(2))
                }));

                const top4 = productosCalculados
                    .sort((a, b) => b.valorTotal - a.valorTotal)
                    .slice(0, 4);

                setInversionTotal(capitalInmovilizado);
                setTopInversion(top4);
                setGastoMensual({ total: acumuladoMesActual, tendencia: calcularTendencia(acumuladoMesActual, acumuladoMesAnterior) });
                setGastoSemanal({ total: acumuladoSemanaActual, tendencia: calcularTendencia(acumuladoSemanaActual, acumuladoSemanaAnterior) });
                setDatosDona(datosGraficoDona);
                setHistorialAnual(datosGraficoBarras); 
            }
            setCargando(false);
        };

        cargarDatosReales();
    }, [sessionUser?.profile?.familia_id]);

    const renderTendencia = (tendencia: number, texto: string) => {
        const subioGasto = tendencia > 0;
        const colorClass = subioGasto ? "text-rose-500" : "text-emerald-500";
        const Icon = subioGasto ? TrendingUp : TrendingDown;
        const signo = subioGasto ? "+" : "";

        return (
            <p className={`text-xs ${colorClass} flex items-center mt-1 font-medium`}>
                <Icon className="w-3 h-3 mr-1" />
                {signo}{tendencia.toFixed(1)}% {texto}
            </p>
        );
    };

    const obtenerColor = (nombreCategoria: string, index: number) => {
        return COLORES_FIJOS[nombreCategoria] || COLORES_EXTRA[index % COLORES_EXTRA.length];
    };

    if (cargando) return <div className="text-center py-8 text-muted-foreground animate-pulse">Calculando presupuesto familiar...</div>;

    return (
        <div className="space-y-6">

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Compras del Mes</p>
                            <h3 className="text-2xl font-bold text-slate-800">{gastoMensual.total.toFixed(2)}€</h3>
                            {renderTendencia(gastoMensual.tendencia, "vs mes pasado")}
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-green-500">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Dinero en Despensa</p>
                            <h3 className="text-2xl font-bold text-slate-800">{inversionTotal.toFixed(2)}€</h3>
                            <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
                                Valor de mis provisiones
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
                            <p className="text-sm text-muted-foreground font-medium mb-1">Compras de la Semana</p>
                            <h3 className="text-2xl font-bold text-slate-800">{gastoSemanal.total.toFixed(2)}€</h3>
                            {renderTendencia(gastoSemanal.tendencia, "vs semana anterior")}
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Distribución de Gastos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        {datosDona.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400">Sin datos</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={datosDona}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {datosDona.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={obtenerColor(entry.name, index)} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => [`${Number(value).toFixed(2)}€`, 'Total']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Historial de Compras ({new Date().getFullYear()})</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historialAnual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGastoArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="mes"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}€`}
                                    tick={{ fill: '#64748b' }}
                                />

                                <Tooltip
                                    labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                    formatter={(value: any) => [`${Number(value).toFixed(2)}€`, 'Gasto']}
                                    cursor={{ stroke: 'var(--success)', strokeWidth: 2, fill: 'var(--success)', opacity: 0.1 }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'var(--card)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="gasto"
                                    stroke="var(--success)"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorGastoArea)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-800">Productos Más Valiosos en Despensa</CardTitle>
                </CardHeader>
                <CardContent>
                    {topInversion.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Tu despensa está vacía.</p>
                    ) : (
                        <ul className="space-y-4">
                            {topInversion.map((prod, index) => (
                                <li key={index} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                                    <div>
                                        {/* 🔥 Aquí está la magia: Nombre + Formato chiquito al costado */}
                                        <p className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                            {prod.nombre}
                                            {prod.formato && (
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    ({prod.formato})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Cantidad: {prod.cantidad}</p>
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
    );
}