import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabase } from "@/database/supabase/Client";
import toast from "react-hot-toast";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

interface Categoria {
    id: string;
    nombre: string;
}


// Cámbialo para que reciba la prop
export default function FormRegistroProducto({ onProductoAgregado }: { onProductoAgregado?: () => void }) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [datosFormulario, setDatosFormulario] = useState({
        nombre: "",
        marca: "",
        precio: 0,
        cantidad: 1,
        stock_minimo: 1,
        fecha_caducidad: "",
        categoria_id: ""
    });

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

        obtenerCategorias();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setDatosFormulario(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // evita que la pagina recargue

        const idUsuarioLogueado = sessionUser?.profile?.id;
        const idFamilia = sessionUser?.profile?.familia_id;

        if (!idUsuarioLogueado || !idFamilia) {
            toast.error("Faltan datos del usuario o familia. No se puede guardar.");
            return;
        }

        // armamos el objeto para supabase
        const productoParaSupabase = {
            nombre: datosFormulario.nombre.trim(),
            marca: datosFormulario.marca.trim() || null,
            precio: Number(datosFormulario.precio),
            cantidad: Number(datosFormulario.cantidad),
            stock_minimo: Number(datosFormulario.stock_minimo),
            fecha_caducidad: datosFormulario.fecha_caducidad,
            categoria_id: datosFormulario.categoria_id ? datosFormulario.categoria_id.trim() : null,
            familia_id: idFamilia, 
            agregado_por: idUsuarioLogueado
        };
        // insertamos en Supabase
        const {error } = await supabase
            .from('productos')
            .insert([productoParaSupabase]);

        if (error) {
            console.error("Error completo de BD:", error);
            toast.error(`Error de BD: ${error.message} \nDetalles: ${error.details}`);
        } else {
            toast.success("¡Producto guardado correctamente!");
            if (onProductoAgregado) onProductoAgregado();
            // limpiamos el formulario reseteando el estado
            setDatosFormulario({
               nombre: "",
                marca: "",
                precio: 0,
                cantidad: 1,
                stock_minimo: 1,
                fecha_caducidad: "",
                categoria_id: ""
            });
        }

    };

    if (sessionUser?.role === 'AdminUser') return null;


    return (
        <Dialog>
            <DialogTrigger className="bg-success hover:bg-success-hover text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                <Plus className="w-5 h-5" />
                Agregar Producto
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos del producto para guardarlo en tu despensa.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre del producto</Label>
                            <Input id="nombre" value={datosFormulario.nombre} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="marca">Marca (Opcional)</Label>
                            <Input id="marca" value={datosFormulario.marca} onChange={handleChange} placeholder="Ej. Gloria, Don Vittorio" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cantidad">Cantidad</Label>
                            <Input id="cantidad" type="number" min="1" value={datosFormulario.cantidad} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock_minimo">Stock Mín.</Label>
                            <Input id="stock_minimo" type="number" min="1" value={datosFormulario.stock_minimo} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="precio">Precio unitario</Label>
                            <Input id="precio" type="number" step="0.01" min="0" value={datosFormulario.precio} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fecha_caducidad">Vencimiento</Label>
                            <Input id="fecha_caducidad" type="date" value={datosFormulario.fecha_caducidad} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoria_id">Categoría</Label>
                            <select
                                id="categoria_id"
                                value={datosFormulario.categoria_id}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                            >
                                <option value="">Selecciona...</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Button type="submit" className="bg-green-600 text-white w-full mt-2">
                        Guardar en Despensa
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}


