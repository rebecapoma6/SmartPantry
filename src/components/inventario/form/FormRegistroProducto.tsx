import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

interface Categoria {
    id: string;
    nombre: string;
}

interface FormRegistroProductoProps {
    abierto: boolean;
    onClose: () => void;
    producto: any | null;
    onRegistroExitoso: () => void;
}

export default function FormRegistroProducto({ abierto, onClose, producto, onRegistroExitoso }: FormRegistroProductoProps) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [guardando, setGuardando] = useState(false);
    
    // Estado para saber si debemos mantener el modal abierto después de guardar
    const [mantenerAbierto, setMantenerAbierto] = useState(false);

    // 🔥 Agregamos el campo formato
    const estadoInicial = {
        nombre: "",
        formato: "", 
        marca: "",
        precio: 0,
        cantidad: 1,
        stock_minimo: 1,
        fecha_caducidad: "",
        categoria_id: ""
    };

    const [datosFormulario, setDatosFormulario] = useState(estadoInicial);
    const sessionUser = useAuthStore((state) => state.sessionUser);

    useEffect(() => {
        const obtenerCategorias = async () => {
            const { data, error } = await supabase
                .from('categorias')
                .select('id, nombre')
                .order('nombre', { ascending: true });

            if (error) console.error("Error al traer categorías:", error);
            else if (data) setCategorias(data);
        };
        if (abierto) {
            obtenerCategorias();
        }
    }, [abierto]);

    useEffect(() => {
        if (producto) {
          const idEncontrado = producto.categoria_id || producto.categorias?.id || "";

            setDatosFormulario({
                nombre: producto.nombre || "",
                formato: producto.formato || "", // 🔥 Cargamos el formato
                marca: producto.marca || "",
                precio: producto.precio || 0,
                cantidad: producto.cantidad || 1,
                stock_minimo: producto.stock_minimo || 1,
                fecha_caducidad: producto.fecha_caducidad || "",
                categoria_id: idEncontrado 
            });
        } else {
            setDatosFormulario(estadoInicial);
        }
    }, [producto, abierto]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setDatosFormulario(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (guardando) return;
        setGuardando(true);

        const idUsuarioLogueado = sessionUser?.profile?.id;
        const idFamilia = sessionUser?.profile?.familia_id;

        if (!idUsuarioLogueado || !idFamilia) {
            toast.error("Faltan datos del usuario o familia. No se puede guardar.");
            setGuardando(false);
            return;
        }

        const toastId = toast.loading(producto ? "Actualizando producto..." : "Guardando producto...");

        try {
            if (producto) {
                const datosAActualizar = {
                    nombre: datosFormulario.nombre.trim(),
                    formato: datosFormulario.formato.trim() || null, // 🔥 Enviamos formato
                    marca: datosFormulario.marca.trim() || null,
                    precio: Number(datosFormulario.precio),
                    cantidad: Number(datosFormulario.cantidad),
                    stock_minimo: Number(datosFormulario.stock_minimo),
                    fecha_caducidad: datosFormulario.fecha_caducidad,
                    categoria_id: datosFormulario.categoria_id ? datosFormulario.categoria_id.trim() : null,
                };

                const { data, error } = await supabase
                    .from('productos')
                    .update(datosAActualizar)
                    .eq('id', producto.id)
                    .select();

                if (error) throw error;
                if (!data || data.length === 0) {
                    throw new Error("La base de datos bloqueó la edición. Verifica los permisos RLS de la tabla productos.");
                }

                toast.success("¡Producto actualizado!", { id: toastId });

            } else {
                const productoParaSupabase = {
                    nombre: datosFormulario.nombre.trim(),
                    formato: datosFormulario.formato.trim() || null, // 🔥 Enviamos formato
                    marca: datosFormulario.marca.trim() || null,
                    precio: Number(datosFormulario.precio),
                    cantidad: Number(datosFormulario.cantidad),
                    stock_minimo: Number(datosFormulario.stock_minimo),
                    fecha_caducidad: datosFormulario.fecha_caducidad,
                    categoria_id: datosFormulario.categoria_id ? datosFormulario.categoria_id.trim() : null,
                    familia_id: idFamilia,
                    agregado_por: idUsuarioLogueado
                };

                const { error } = await supabase
                    .from('productos')
                    .insert([productoParaSupabase]);

                if (error) throw error;
                toast.success("¡Producto guardado correctamente!", { id: toastId });
            }

            onRegistroExitoso();

            // Si pulsó "Añadir otro", limpiamos. Si no, cerramos.
            if (mantenerAbierto && !producto) {
                setDatosFormulario(estadoInicial);
            } else {
                onClose();
            }

        } catch (error: any) {
            console.error("Error completo:", error);
            toast.error(error.message || "Error al procesar la solicitud", { id: toastId });
        } finally {
            setGuardando(false); 
            setMantenerAbierto(false); // Reseteamos el estado
        }
    };

    return (
        <Dialog open={abierto} onOpenChange={(estaAbierto) => { if (!estaAbierto) onClose(); }}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{producto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                    <DialogDescription>
                        {producto
                            ? "Modifica los datos del producto en tu despensa."
                            : "Ingresa los datos del producto para guardarlo en tu despensa."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    
                    {/* 🔥 FILA 1: Nombre y Formato */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" value={datosFormulario.nombre} onChange={handleChange} placeholder="Ej. Arroz largo" required disabled={guardando} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="formato">Formato</Label>
                            <Input id="formato" value={datosFormulario.formato} onChange={handleChange} placeholder="Ej. Kg,L," required disabled={guardando} />
                        </div>
                    </div>

                    {/* 🔥 FILA 2: Cantidad, Stock Min, Precio */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cantidad">Cantidad</Label>
                            <Input id="cantidad" type="number" min="0" value={datosFormulario.cantidad} onChange={handleChange} required disabled={guardando} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock_minimo">Stock Mín.</Label>
                            <Input id="stock_minimo" type="number" min="0" value={datosFormulario.stock_minimo} onChange={handleChange} disabled={guardando} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="precio">Precio Total (€)</Label>
                            <Input id="precio" type="number" step="0.01" min="0" value={datosFormulario.precio} onChange={handleChange} disabled={guardando} />
                        </div>
                    </div>

                    {/* 🔥 FILA 3: Marca, Vencimiento, Categoría */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="marca">Marca</Label>
                            <Input id="marca" value={datosFormulario.marca} onChange={handleChange} placeholder="Ej. Lidel" disabled={guardando} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_caducidad">Vencimiento</Label>
                            <Input id="fecha_caducidad" type="date" value={datosFormulario.fecha_caducidad} onChange={handleChange} disabled={guardando} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoria_id">Categoría</Label>
                            <select
                                id="categoria_id"
                                value={datosFormulario.categoria_id}
                                onChange={handleChange}
                                disabled={guardando}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                            >
                                <option value="">Selecciona...</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <Button 
                            type="submit" 
                            disabled={guardando} 
                            onClick={() => setMantenerAbierto(false)}
                            className="bg-green-600 text-white w-full hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {guardando ? "Guardando..." : (producto ? "Guardar Cambios" : "Guardar y Cerrar")}
                        </Button>

                        {!producto && (
                            <Button 
                                type="submit" 
                                variant="outline"
                                disabled={guardando} 
                                onClick={() => setMantenerAbierto(true)}
                                className="w-full border-green-600 text-green-700 hover:bg-green-50"
                            >
                                Guardar y añadir otro producto
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}