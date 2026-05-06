import { useState, useEffect } from "react";
import { supabase } from "@/database/supabase/Client";
import { ShoppingCart, AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

// 🔥 1. Importamos tu store para saber de qué familia eres
import { useAuthStore } from "@/stores/useAuthStore";

interface Producto {
    id: string;
    nombre: string;
    cantidad: number;
    stock_minimo: number;
    precio?: number;
    // 🔥 2. Le decimos a TypeScript que ahora la categoría viene como un objeto desde la otra tabla
    categorias?: { nombre: string };
}

export default function ListaCompras() {
    const [productosFaltantes, setProductosFaltantes] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);

    // Sacamos los datos de tu sesión
    const sessionUser = useAuthStore((state: any) => state.sessionUser);

    useEffect(() => {
        // Solo cargamos si ya tenemos los datos de la sesión
        if (sessionUser) {
            cargarListaInteligente();
        }
    }, [sessionUser]);

    const cargarListaInteligente = async () => {
        try {
            setLoading(true);

            // Asegúrate de que el nombre del campo de tu familia se llame 'familia_id' en tu profile
            const miFamiliaId = sessionUser?.profile?.familia_id;

            // 🔥 3. EL SUPER QUERY: Traemos todo, cruzamos con la tabla categorias, y filtramos por TU familia
            let query = supabase
                .from('productos')
                .select('*, categorias(nombre)');

            // Si tienes un ID de familia, filtramos. Si no, al menos por tu ID de usuario para que no salgan cosas de otros
            if (miFamiliaId) {
                query = query.eq('familia_id', miFamiliaId);
            } else if (sessionUser?.profile?.id) {
                query = query.eq('agregado_por', sessionUser.profile.id);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                //   Usamos "<" (menor estricto) en lugar de "<=" para evitar compras innecesarias. 
                //   Ej: Si el café rinde meses (mínimo 1) y tengo 1, "1 < 1" es Falso (no compro). 
                //   Solo cuando se me acabe y llegue a 0, "0 < 1" será Verdadero y me avisará.
                const aComprar = data.filter((prod) => prod.cantidad < prod.stock_minimo); setProductosFaltantes(aComprar);
            }
        } catch (error) {
            console.error("Error al cargar la lista inteligente:", error);
            toast.error("Error al cargar la lista");
        } finally {
            setLoading(false);
        }
    };

    const compartirPorWhatsApp = () => {
        if (productosFaltantes.length === 0) return;

        let mensaje = "🛒 *Lista de Compras - SmartPantry* \n\n";
        let totalEstimado = 0;

        productosFaltantes.forEach(prod => {
            const precioUnitario = prod.precio || 0;
            const faltante = prod.stock_minimo - prod.cantidad;
            const cantidadAComprar = faltante > 0 ? faltante : 1;

            const subtotal = precioUnitario * cantidadAComprar;
            totalEstimado += subtotal;

            mensaje += `- ${prod.nombre} (x${cantidadAComprar}) - ${subtotal.toFixed(2)} €\n`;
        });

        mensaje += `\n💰 *Total Estimado: ${totalEstimado.toFixed(2)} €*\n`;
        mensaje += `\n_Generado automáticamente desde mi despensa._`;

        const textoCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/?text=${textoCodificado}`, '_blank');
    };

    if (loading) {
        return <div className="p-10 text-center text-muted-foreground animate-pulse">Analizando tu despensa...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-2">
            <Card className="shadow-md border-slate-100 rounded-2xl overflow-hidden flex flex-col">
                <CardHeader className="bg-muted/50 border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2.5 text-slate-800">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <ShoppingCart className="w-5 h-5 text-amber-600" />
                            </div>
                            Lista de Compras Inteligente
                        </CardTitle>
                        <CardDescription className="text-sm mt-1.5 text-muted-foreground">
                            Generada automáticamente basada en los niveles de stock de tu despensa.
                        </CardDescription>
                    </div>

                    <Button
                        onClick={compartirPorWhatsApp}
                        disabled={productosFaltantes.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all flex items-center gap-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Compartir por WhatsApp
                    </Button>
                </CardHeader>

                <CardContent className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {productosFaltantes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">¡Tu despensa está a tope!</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                No tienes ningún producto por debajo del stock mínimo. Tienes todo lo necesario para sobrevivir.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {productosFaltantes.map((prod) => (
                                <div key={prod.id} className="p-5 flex items-center justify-between hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{prod.nombre}</h4>
                                            {/* 🔥 5. Mostramos el nombre de la categoría jalado desde la otra tabla */}
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Categoría: {prod.categorias?.nombre || 'Sin categoría'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Stock Actual</p>
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="font-bold text-red-600">{prod.cantidad}</span>
                                                <span className="text-slate-400 text-xs">/ min {prod.stock_minimo}</span>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1 font-bold shrink-0">
                                            ¡Comprar!
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}