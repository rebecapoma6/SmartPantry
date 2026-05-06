import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/database/supabase/Client";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

interface Categoria {
    id: string;
    nombre: string;
}

interface ModalCategoriasProps {
    abierto: boolean;
    onClose: () => void;
    onCategoriasActualizadas: () => void; // Para avisar al form principal que recargue el <select>
}

export default function ModalCategorias({ abierto, onClose, onCategoriasActualizadas }: ModalCategoriasProps) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [nuevaCategoria, setNuevaCategoria] = useState("");
    const [cargando, setCargando] = useState(false);

    const sessionUser = useAuthStore((state) => state.sessionUser);

    // Cargar las categorías de la familia
    const cargarCategorias = async () => {
        if (!sessionUser?.profile?.familia_id) return;

        setCargando(true);
        const { data, error } = await supabase
            .from('categorias')
            .select('id, nombre')
            .eq('familia_id', sessionUser.profile.familia_id)
            .order('nombre', { ascending: true });

        if (error) {
            console.error("Error al cargar categorías:", error);
            toast.error("Error al cargar las categorías.");
        } else if (data) {
            setCategorias(data);
        }
        setCargando(false);
    };

    // Cargar al abrir el modal
    useEffect(() => {
        if (abierto) {
            cargarCategorias();
        }
    }, [abierto, sessionUser?.profile?.familia_id]);

    // Función para crear una nueva categoría
    const handleCrearCategoria = async (e: FormEvent) => {
        e.preventDefault();

        const nombreTrimmed = nuevaCategoria.trim();
        if (!nombreTrimmed) return;

        const idFamilia = sessionUser?.profile?.familia_id;
        if (!idFamilia) {
            toast.error("Error: No se encontró la familia del usuario.");
            return;
        }

        setCargando(true);
        const { data, error } = await supabase
            .from('categorias')
            .insert([{ nombre: nombreTrimmed, familia_id: idFamilia }])
            .select(); // Forzamos a que devuelva la data insertada

        if (error) {
            console.error("Error al crear categoría:", error);
            toast.error("No se pudo crear la categoría.");
        } else if (data && data.length > 0) {
            toast.success(`Categoría "${nombreTrimmed}" agregada.`);
            setNuevaCategoria(""); // Limpiar input
            setCategorias(prev => [...prev, data[0]].sort((a, b) => a.nombre.localeCompare(b.nombre))); // Actualizar lista local
            onCategoriasActualizadas(); // Avisar al componente padre
        }
        setCargando(false);
    };

    // Función para eliminar una categoría
    const handleEliminarCategoria = async (id: string, nombre: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <div>
                    <p className="text-sm font-semibold text-foreground">¿Eliminar "{nombre}"?</p>
                    <p className="text-xs text-muted-foreground mt-1">Los productos asociados podrían quedar sin categoría.</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toast.dismiss(t.id)} // Cierra el toast sin hacer nada
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={async () => {
                            toast.dismiss(t.id); // Cerramos el toast de la pregunta

                            // 👇 EMPIEZA EL BORRADO REAL 👇
                            setCargando(true);
                            const idCarga = toast.loading("Eliminando...");

                            const { error } = await supabase
                                .from('categorias')
                                .delete()
                                .eq('id', id);

                            if (error) {
                                console.error("Error al eliminar categoría:", error);
                                if (error.code === '23503') {
                                    toast.error(`No puedes eliminar "${nombre}" porque hay productos usándola.`, { id: idCarga });
                                } else {
                                    toast.error("Hubo un error al eliminar.", { id: idCarga });
                                }
                            } else {
                                toast.success(`Categoría "${nombre}" eliminada.`, { id: idCarga });
                                setCategorias(prev => prev.filter(cat => cat.id !== id));
                                onCategoriasActualizadas();
                            }
                            setCargando(false);
                        }}
                    >
                        Sí, eliminar
                    </Button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <Dialog open={abierto} onOpenChange={(estaAbierto) => { if (!estaAbierto) onClose(); }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gestionar Categorías</DialogTitle>
                    <DialogDescription>
                        Administra las categorías personalizadas para tu despensa.
                    </DialogDescription>
                </DialogHeader>

                {/* Formulario rápido para crear */}
                <form onSubmit={handleCrearCategoria} className="flex gap-2 my-4">
                    <Input
                        placeholder="Ej. Lácteos, Vegano..."
                        value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        disabled={cargando}
                        required
                    />
                    <Button type="submit" disabled={cargando || !nuevaCategoria.trim()} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </form>

                {/* Lista de categorías */}
                <div className="border rounded-md max-h-[300px] overflow-y-auto">
                    {categorias.length === 0 ? (
                        <p className="text-center p-4 text-muted-foreground text-sm">No hay categorías. ¡Crea la primera!</p>
                    ) : (
                        <ul className="divide-y">
                            {categorias.map((cat) => (
                                <li key={cat.id} className="flex justify-between items-center p-3 hover:bg-muted/50 transition-colors">
                                    <span className="text-sm font-medium">{cat.nombre}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                        onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                                        disabled={cargando}
                                        title="Eliminar categoría"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}